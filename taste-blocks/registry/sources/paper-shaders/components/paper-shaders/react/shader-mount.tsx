/*
 * Modified by Taste Blocks on 2026-07-20:
 * - Repointed @paper-design/shaders imports to copied source-local modules.
 * - Added a deterministic no-WebGL fallback and mapped reduced motion to the supplied static frame.
 * - Removed explicit .js suffixes from relative local TypeScript imports.
 */
'use client';

import { useEffect, useRef, forwardRef, useState } from 'react';
import {
  ShaderMount as ShaderMountVanilla,
  type PaperShaderElement,
  type ShaderMotionParams,
  type ShaderMountUniforms,
} from '../core/shader-mount';
import { emptyPixel } from '../core/empty-pixel';
import { useMergeRefs } from './use-merge-refs';
import { setMinImageSize } from './set-min-image-size';

const fallbackColor = '#737373';

/**
 * React Shader Mount can also accept strings as uniform values, which will assumed to be URLs and loaded as images
 *
 * We accept undefined as a convenience for server rendering, when some things may be undefined
 * We just skip setting the uniform if it's undefined. This allows the shader mount to still take up space during server rendering
 */
interface ShaderMountUniformsReact {
  [key: string]: string | boolean | number | number[] | number[][] | HTMLImageElement | undefined;
}

export interface ShaderMountProps extends Omit<React.ComponentProps<'div'>, 'color' | 'ref'>, ShaderMotionParams {
  ref?: React.Ref<PaperShaderElement>;
  fragmentShader: string;
  uniforms: ShaderMountUniformsReact;
  mipmaps?: string[];
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;

  /** Inline CSS width style */
  width?: string | number;
  /** Inline CSS height style */
  height?: string | number;
}

export interface ShaderComponentProps extends Omit<React.ComponentProps<'div'>, 'color' | 'ref'> {
  ref?: React.Ref<PaperShaderElement>;
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;

  /** Inline CSS width style */
  width?: string | number;
  /** Inline CSS height style */
  height?: string | number;
}

/** Parse the provided uniforms, turning URL strings into loaded images */
async function processUniforms(uniformsProp: ShaderMountUniformsReact): Promise<ShaderMountUniforms> {
  const processedUniforms = {} as ShaderMountUniforms;
  const imageLoadPromises: Promise<void>[] = [];

  const isValidUrl = (url: string): boolean => {
    try {
      // Handle absolute paths
      if (url.startsWith('/')) return true;
      // Check if it's a valid URL
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isExternalUrl = (url: string): boolean => {
    try {
      if (url.startsWith('/')) return false;
      const urlObject = new URL(url, window.location.origin);
      return urlObject.origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  Object.entries(uniformsProp).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Use a transparent pixel for empty strings
      const url = value || emptyPixel;

      // Make sure the provided string is a valid URL or just skip trying to set this uniform entirely
      if (!isValidUrl(url)) {
        console.warn(`Uniform "${key}" has invalid URL "${url}". Skipping image loading.`);
        return;
      }

      const imagePromise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        if (isExternalUrl(url)) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          setMinImageSize(img);
          processedUniforms[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Could not set uniforms. Failed to load image at ${url}`);
          reject();
        };
        img.src = url;
      });

      imageLoadPromises.push(imagePromise);
    } else if (value instanceof HTMLImageElement) {
      setMinImageSize(value);
      processedUniforms[key] = value;
    } else {
      processedUniforms[key] = value;
    }
  });

  await Promise.all(imageLoadPromises);
  return processedUniforms;
}

/**
 * A React component that mounts a shader and updates its uniforms as the component's props change
 * If you pass a string as a uniform value, it will be assumed to be a URL and attempted to be loaded as an image
 */
export const ShaderMount: React.FC<ShaderMountProps> = forwardRef<PaperShaderElement, ShaderMountProps>(
  function ShaderMountImpl(
    {
      fragmentShader,
      uniforms: uniformsProp,
      webGlContextAttributes,
      speed = 0,
      frame = 0,
      width,
      height,
      minPixelRatio,
      maxPixelCount,
      mipmaps,
      style,
      ...divProps
    },
    forwardedRef
  ) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const divRef = useRef<PaperShaderElement>(null);
    const shaderMountRef: React.RefObject<ShaderMountVanilla | null> = useRef<ShaderMountVanilla>(null);
    const webGlContextAttributesRef = useRef(webGlContextAttributes);
    const effectiveSpeed = prefersReducedMotion ? 0 : speed;

    useEffect(() => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const updatePreference = () => setPrefersReducedMotion(media.matches);
      updatePreference();
      media.addEventListener('change', updatePreference);
      return () => media.removeEventListener('change', updatePreference);
    }, []);

    // Initialize the ShaderMountVanilla
    useEffect(() => {
      const initShader = async () => {
        const uniforms = await processUniforms(uniformsProp);

        if (divRef.current && !shaderMountRef.current) {
          const probe = divRef.current.ownerDocument.createElement('canvas');
          let webGl: WebGL2RenderingContext | null;
          try {
            webGl = probe.getContext('webgl2', webGlContextAttributesRef.current);
          } catch {
            return;
          }
          if (!webGl) return;
          webGl.getExtension('WEBGL_lose_context')?.loseContext();

          shaderMountRef.current = new ShaderMountVanilla(
            divRef.current,
            fragmentShader,
            uniforms,
            webGlContextAttributesRef.current,
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : speed,
            frame,
            minPixelRatio,
            maxPixelCount,
            mipmaps
          );

          setIsInitialized(true);
        }
      };

      initShader();

      return () => {
        shaderMountRef.current?.dispose();
        shaderMountRef.current = null;
      };
    }, [fragmentShader]);

    // Uniforms
    useEffect(() => {
      let isStale = false;

      const updateUniforms = async () => {
        const uniforms = await processUniforms(uniformsProp);

        if (!isStale) {
          // We only use the freshest uniforms otherwise we can get into race conditions
          // if some uniforms (images!) take longer to load in subsequent effect runs.
          shaderMountRef.current?.setUniforms(uniforms);
        }
      };

      updateUniforms();

      return () => {
        isStale = true;
      };
    }, [uniformsProp, isInitialized]);

    // Speed
    useEffect(() => {
      shaderMountRef.current?.setSpeed(effectiveSpeed);
    }, [effectiveSpeed, isInitialized]);

    // Max Pixel Count
    useEffect(() => {
      shaderMountRef.current?.setMaxPixelCount(maxPixelCount);
    }, [maxPixelCount, isInitialized]);

    // Min Pixel Ratio
    useEffect(() => {
      shaderMountRef.current?.setMinPixelRatio(minPixelRatio);
    }, [minPixelRatio, isInitialized]);

    // Frame
    useEffect(() => {
      shaderMountRef.current?.setFrame(frame);
    }, [frame, isInitialized, prefersReducedMotion]);

    const mergedRef = useMergeRefs([divRef, forwardedRef]) as unknown as React.RefObject<HTMLDivElement>;
    return (
      <div
        ref={mergedRef}
        data-paper-shader-fallback={isInitialized ? undefined : ''}
        style={{
          ...(isInitialized ? {} : { backgroundColor: fallbackColor }),
          ...(width === undefined ? {} : { width: typeof width === 'string' && isNaN(+width) === false ? +width : width }),
          ...(height === undefined
            ? {}
            : { height: typeof height === 'string' && isNaN(+height) === false ? +height : height }),
          ...style,
        }}
        {...divProps}
      />
    );
  }
);

ShaderMount.displayName = 'ShaderMount';
