/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to the copied source-local core modules.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import { getShaderColorFromString } from '../../core/get-shader-color-from-string';
import { type ImageShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultObjectSizing } from '../../core/shader-sizing';
import {
  gemSmokeFragmentShader,
  type GemSmokeUniforms,
  type GemSmokeParams,
  toProcessedGemSmoke,
  GemSmokeShapes,
} from '../../core/shaders/gem-smoke';
import { transparentPixel } from '../transparent-pixel';
import { suspend } from '../suspend';

export interface GemSmokeProps extends ShaderComponentProps, GemSmokeParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type GemSmokePreset = ImageShaderPreset<GemSmokeParams>;

export const defaultPreset: GemSmokePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#f0efea',
    colorInner: '#fafaf5',
    colors: ['#333333', '#e7e6df'],
    outerGlow: 0.55,
    innerGlow: 1,
    innerDistortion: 0.8,
    outerDistortion: 0.6,
    offset: 0,
    angle: 0,
    size: 0.8,
    shape: 'diamond',
  },
};

export const fluorescentPreset: GemSmokePreset = {
  name: 'Fluorescent',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorInner: '#000000',
    colors: ['#2fb64c', '#cdff61', '#ffffff'],
    outerGlow: 0,
    innerGlow: 1,
    innerDistortion: 1,
    outerDistortion: 0.8,
    offset: 0,
    angle: 0,
    size: 0.8,
    shape: 'diamond',
  },
};

export const firePreset: GemSmokePreset = {
  name: 'Fire',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorInner: '#000000',
    colors: ['#fe5b16', '#f7ff61', '#ffffff'],
    outerGlow: 1,
    innerGlow: 0.65,
    innerDistortion: 0.6,
    outerDistortion: 0.8,
    offset: 0,
    angle: 0,
    size: 0.8,
    shape: 'diamond',
  },
};

export const infraredPreset: GemSmokePreset = {
  name: 'Infrared',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 0.5,
    frame: 0,
    colorBack: '#cd28dc',
    colorInner: '#00000000',
    colors: ['#ff9900', '#fff67a', '#dcff52', '#00ffbb', '#0077ff'],
    outerGlow: 1,
    innerGlow: 1,
    innerDistortion: 1,
    outerDistortion: 1,
    offset: 0.2,
    angle: 0,
    size: 1,
    shape: 'diamond',
  },
};

export const gemSmokePresets: GemSmokePreset[] = [defaultPreset, firePreset, fluorescentPreset, infraredPreset];

export const GemSmoke: React.FC<GemSmokeProps> = memo(function GemSmokeImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  innerDistortion = defaultPreset.params.innerDistortion,
  outerDistortion = defaultPreset.params.outerDistortion,
  outerGlow = defaultPreset.params.outerGlow,
  innerGlow = defaultPreset.params.innerGlow,
  colorInner = defaultPreset.params.colorInner,
  offset = defaultPreset.params.offset,
  angle = defaultPreset.params.angle,
  size = defaultPreset.params.size,
  shape = defaultPreset.params.shape,
  suspendWhenProcessingImage = false,

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
}: GemSmokeProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedGemSmoke(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'gemSmoke']
    );
  } else {
    processedImage = processedStateImage;
  }

  useLayoutEffect(() => {
    if (suspendWhenProcessingImage) {
      // Skip doing work in the effect as it's been handled by suspense.
      return;
    }

    if (!imageUrl) {
      setProcessedStateImage(transparentPixel);
      return;
    }

    let url: string;
    let current = true;

    toProcessedGemSmoke(imageUrl).then((result) => {
      if (current) {
        url = URL.createObjectURL(result.pngBlob);
        setProcessedStateImage(url);
      }
    });

    return () => {
      current = false;
    };
  }, [imageUrl, suspendWhenProcessingImage]);

  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_colorBack: getShaderColorFromString(colorBack),
    u_image: processedImage,
    u_innerDistortion: innerDistortion,
    u_outerDistortion: outerDistortion,
    u_outerGlow: outerGlow,
    u_innerGlow: innerGlow,
    u_colorInner: getShaderColorFromString(colorInner),
    u_offset: offset,
    u_angle: angle,
    u_size: size,
    u_isImage: Boolean(image),
    u_shape: GemSmokeShapes[shape],

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
  } satisfies GemSmokeUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={gemSmokeFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
