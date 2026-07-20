/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to the copied source-local core modules.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { getShaderColorFromString } from '../../core/get-shader-color-from-string';
import { type ImageShaderPreset } from '../../core/shader-mount';
import { ShaderFitOptions, defaultObjectSizing } from '../../core/shader-sizing';
import {
  liquidMetalFragmentShader,
  type LiquidMetalUniforms,
  type LiquidMetalParams,
  toProcessedLiquidMetal,
  LiquidMetalShapes,
} from '../../core/shaders/liquid-metal';
import { transparentPixel } from '../transparent-pixel';
import { suspend } from '../suspend';

export interface LiquidMetalProps extends ShaderComponentProps, LiquidMetalParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type LiquidMetalPreset = ImageShaderPreset<LiquidMetalParams>;

export const defaultPreset: LiquidMetalPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#AAAAAC',
    colorTint: '#ffffff',
    distortion: 0.07,
    repetition: 2.0,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    contour: 0.4,
    softness: 0.1,
    angle: 70,
    shape: 'diamond',
  },
};

export const noirPreset: LiquidMetalPreset = {
  name: 'Noir',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorTint: '#606060',
    softness: 0.45,
    repetition: 1.5,
    shiftRed: 0,
    shiftBlue: 0,
    distortion: 0,
    contour: 0,
    angle: 90,
    shape: 'diamond',
  },
};

export const fullScreenPreset: LiquidMetalPreset = {
  name: 'Backdrop',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    scale: 1,
    colorBack: '#AAAAAC',
    colorTint: '#ffffff',
    softness: 0.05,
    repetition: 1.5,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    distortion: 0.1,
    contour: 0.4,
    shape: 'none',
    angle: 90,
    worldWidth: 0,
    worldHeight: 0,
  },
};

export const stripesPreset: LiquidMetalPreset = {
  name: 'Stripes',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    scale: 0.6,
    colorBack: '#000000',
    colorTint: '#2c5d72',
    softness: 0.8,
    repetition: 6,
    shiftRed: 1,
    shiftBlue: -1,
    distortion: 0.4,
    contour: 0.4,
    shape: 'circle',
    angle: 0,
  },
};

export const liquidMetalPresets: LiquidMetalPreset[] = [defaultPreset, noirPreset, fullScreenPreset, stripesPreset];

export const LiquidMetal: React.FC<LiquidMetalProps> = memo(function LiquidMetalImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorTint = defaultPreset.params.colorTint,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  contour = defaultPreset.params.contour,
  distortion = defaultPreset.params.distortion,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  shiftRed = defaultPreset.params.shiftRed,
  shiftBlue = defaultPreset.params.shiftBlue,
  angle = defaultPreset.params.angle,
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
}: LiquidMetalProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedLiquidMetal(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'liquid-metal']
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

    toProcessedLiquidMetal(imageUrl).then((result) => {
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
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorTint: getShaderColorFromString(colorTint),

    u_image: processedImage,
    u_contour: contour,
    u_distortion: distortion,
    u_softness: softness,
    u_repetition: repetition,
    u_shiftRed: shiftRed,
    u_shiftBlue: shiftBlue,
    u_angle: angle,
    u_isImage: Boolean(image),
    u_shape: LiquidMetalShapes[shape],

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
  } satisfies LiquidMetalUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={liquidMetalFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
});
