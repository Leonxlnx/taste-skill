"use client";

import {
  animate,
  type AnimationPlaybackControls,
  type Easing,
} from "framer-motion";
import { cn } from "./lib/utils";
import { WebGLErrorBoundary, WebGLFallback } from "./webgl-error-boundary";
import * as React from "react";

export interface RippleTransitionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onClick"> {
  /** Images to transition between. Use at least two images for the ripple swap. */
  images: readonly string[];
  /** Transition duration in seconds. */
  duration?: number;
  /** Easing curve used by Framer Motion. */
  ease?: Easing;
  /** Automatically trigger transitions on an interval. */
  autoPlay?: boolean;
  /** Delay between automatic transitions in milliseconds. */
  autoPlayInterval?: number;
  /** Start point for autoplay ripples. */
  autoPlayOrigin?: "center" | "random";
  /** Speed of the expanding wavefront. */
  waveSpeed?: number;
  /** Thickness of the main ripple band. */
  sigma?: number;
  /** Frequency of the small concentric ripples. */
  waveFreq?: number;
  /** Amount of radial image displacement. */
  pushAmt?: number;
  /** Chromatic aberration strength. */
  caStrength?: number;
  /** Bloom-like highlight strength on the wave. */
  glow?: number;
  /** Noise applied to the ripple edge. */
  noiseWarp?: number;
  /** Adds a subtle inward pull at the ripple origin. */
  pinch?: boolean;
  /** Root border radius in pixels. */
  borderRadius?: number;
  /** Canvas fallback background. */
  background?: string;
  /** Accessible label for the interactive region. */
  label?: string;
}

const DEFAULTS = {
  waveSpeed: 1.6,
  sigma: 0.15,
  waveFreq: 5,
  pushAmt: 0.145,
  caStrength: 0.02,
  glow: 0.73,
  noiseWarp: 1,
  duration: 1.4,
  ease: "easeInOut" as Easing,
  autoPlay: false,
  autoPlayInterval: 3200,
  autoPlayOrigin: "center" as const,
  pinch: false,
  borderRadius: 24,
  background: "#111416",
};

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;

void main() {
  v_uv = vec2(a_pos.x * 0.5 + 0.5, 0.5 - a_pos.y * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform vec2 u_resolution;
uniform vec2 u_texASize;
uniform vec2 u_texBSize;
uniform vec2 u_center;
uniform float u_progress;
uniform float u_waveSpeed;
uniform float u_sigma;
uniform float u_waveFreq;
uniform float u_pushAmt;
uniform float u_caStrength;
uniform float u_glow;
uniform float u_noiseWarp;
uniform float u_swap;
uniform float u_pinch;

varying vec2 v_uv;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int octaves) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    val += amp * vnoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }

  return val;
}

vec2 coverUv(vec2 uv, vec2 textureSize, vec2 resolution) {
  float textureAspect = textureSize.x / textureSize.y;
  float canvasAspect = resolution.x / resolution.y;
  vec2 scale = vec2(1.0);

  if (canvasAspect > textureAspect) {
    scale.y = textureAspect / canvasAspect;
  } else {
    scale.x = canvasAspect / textureAspect;
  }

  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 uv = v_uv;
  vec2 size = u_resolution;
  vec2 center = u_center;

  vec2 p = uv - center;
  float aspect = size.x / size.y;
  p.x *= aspect;

  float dist = length(p);
  float maxDist = length(vec2(0.5 * aspect, 0.5));
  float normDist = clamp(dist / maxDist, 0.0, 1.0);

  float noiseLarge = fbm(p * 4.0 + vec2(u_progress * 1.0, u_progress * 0.5), 4);
  float noiseSmall = fbm(p * 12.0 + vec2(u_progress * 2.0, -u_progress * 1.5), 3);

  float waveFront = u_progress * u_waveSpeed;
  float warpScale = smoothstep(0.0, 0.05, u_progress);
  float warpedDist = normDist
    + (noiseLarge - 0.5) * u_noiseWarp * warpScale
    + (noiseSmall - 0.5) * (u_noiseWarp * 0.9) * warpScale;

  float delta = warpedDist - waveFront;
  float baseEnvelope = exp(-delta * delta / (2.0 * u_sigma * u_sigma));
  float ripples = max(0.0, cos(delta * u_waveFreq));
  float envelope = baseEnvelope * ripples;
  float gate = smoothstep(0.0, 0.05, u_progress) * (1.0 - smoothstep(0.85, 1.0, u_progress));
  envelope *= gate;

  vec2 dir = (dist > 0.001) ? normalize(p) : vec2(0.0);
  float pushAmt = envelope * u_pushAmt;
  float pinchSigma = 0.10;
  float pinchG = exp(-dist * dist / (2.0 * pinchSigma * pinchSigma));
  float pinchDisp = (dist / (pinchSigma * pinchSigma)) * pinchG * 0.01 * u_pinch;
  vec2 toEdge = min(uv, 1.0 - uv);
  float edgeFade = smoothstep(0.0, 0.14, min(toEdge.x, toEdge.y));
  pinchDisp *= edgeFade;

  vec2 uvOffset = dir * (pushAmt - pinchDisp);
  uvOffset.x /= aspect;

  float caStrength = envelope * u_caStrength;
  vec2 caOffset = dir * caStrength;
  caOffset.x /= aspect;

  vec2 uvR = uv - uvOffset - caOffset;
  vec2 uvG = uv - uvOffset;
  vec2 uvB = uv - uvOffset + caOffset;

  vec4 colorA = vec4(
    texture2D(u_texA, coverUv(uvR, u_texASize, size)).r,
    texture2D(u_texA, coverUv(uvG, u_texASize, size)).g,
    texture2D(u_texA, coverUv(uvB, u_texASize, size)).b,
    1.0
  );
  vec4 colorB = vec4(
    texture2D(u_texB, coverUv(uvR, u_texBSize, size)).r,
    texture2D(u_texB, coverUv(uvG, u_texBSize, size)).g,
    texture2D(u_texB, coverUv(uvB, u_texBSize, size)).b,
    1.0
  );

  float feather = 0.04 + 0.05 * noiseLarge;
  float reveal = smoothstep(waveFront + feather, waveFront - feather, warpedDist);
  reveal *= smoothstep(0.0, 0.05, u_progress);

  vec4 base = mix(colorA, colorB, u_swap);
  vec4 target = mix(colorB, colorA, u_swap);
  vec4 color = mix(base, target, reveal);

  float glow = envelope * u_glow;
  color.rgb = clamp(color.rgb / max(1.0 - glow, 0.01), 0.0, 1.0);
  color.rgb *= 1.0 - 0.16 * pinchG * edgeFade * u_pinch;

  gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), 1.0);
}
`;

type LoadedImage = {
  image: HTMLImageElement;
  width: number;
  height: number;
};

function compileShader(gl: WebGLRenderingContext, src: string, type: number) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Unable to create WebGL shader.");
  }

  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || "Shader compile error.";
    gl.deleteShader(shader);
    throw new Error(info);
  }

  return shader;
}

function loadImage(src: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () =>
      resolve({
        image,
        width: image.naturalWidth || image.width || 1,
        height: image.naturalHeight || image.height || 1,
      });
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function uploadTexture(
  gl: WebGLRenderingContext,
  unit: number,
  image: HTMLImageElement,
) {
  const texture = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture;
}

function RippleTransitionInner({
  images,
  duration = DEFAULTS.duration,
  ease = DEFAULTS.ease,
  autoPlay = DEFAULTS.autoPlay,
  autoPlayInterval = DEFAULTS.autoPlayInterval,
  autoPlayOrigin = DEFAULTS.autoPlayOrigin,
  waveSpeed = DEFAULTS.waveSpeed,
  sigma = DEFAULTS.sigma,
  waveFreq = DEFAULTS.waveFreq,
  pushAmt = DEFAULTS.pushAmt,
  caStrength = DEFAULTS.caStrength,
  glow = DEFAULTS.glow,
  noiseWarp = DEFAULTS.noiseWarp,
  pinch = DEFAULTS.pinch,
  borderRadius = DEFAULTS.borderRadius,
  background = DEFAULTS.background,
  label = "Ripple image transition",
  className,
  style,
  ...props
}: RippleTransitionProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const renderRef = React.useRef<(() => void) | null>(null);
  const triggerRef = React.useRef<((x?: number, y?: number) => void) | null>(null);
  const settleRef = React.useRef<(() => void) | null>(null);
  const activeRef = React.useRef(true);
  const reducedMotionRef = React.useRef(false);
  const [failed, setFailed] = React.useState(false);

  const paramsRef = React.useRef({
    waveSpeed,
    sigma,
    waveFreq,
    pushAmt,
    caStrength,
    glow,
    noiseWarp,
    duration: Math.min(20, Math.max(0.05, duration)),
    ease,
    pinch,
  });

  paramsRef.current = {
    waveSpeed,
    sigma,
    waveFreq,
    pushAmt,
    caStrength,
    glow,
    noiseWarp,
    duration: Math.min(20, Math.max(0.05, duration)),
    ease,
    pinch,
  };

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let intersecting = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateActivity = () => {
      reducedMotionRef.current = reducedMotion.matches;
      activeRef.current = intersecting && !document.hidden;
      if (!activeRef.current || reducedMotion.matches) settleRef.current?.();
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry?.isIntersecting ?? false;
      updateActivity();
    });
    observer.observe(wrapper);
    document.addEventListener("visibilitychange", updateActivity);
    reducedMotion.addEventListener("change", updateActivity);
    updateActivity();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
      reducedMotion.removeEventListener("change", updateActivity);
    };
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) {
      return;
    }

    const canvasElement = canvas;
    const wrapperElement = wrapper;
    let cancelled = false;
    let cleanup: (() => void) | null = null;
    setFailed(false);

    async function setup() {
      const loaded = (await Promise.all(images.slice(0, 12).map(loadImage))).filter(
        (item): item is LoadedImage => item !== null,
      );

      if (cancelled || loaded.length === 0) {
        return;
      }

      const firstImage = loaded[0]!;
      const secondImage = loaded[1] ?? firstImage;
      const gl = canvasElement.getContext("webgl", {
        premultipliedAlpha: false,
        antialias: true,
      });

      if (!gl) {
        return;
      }

      const vertexShader = compileShader(gl, VERT, gl.VERTEX_SHADER);
      const fragmentShader = compileShader(gl, FRAG, gl.FRAGMENT_SHADER);
      const program = gl.createProgram();

      if (!program) {
        throw new Error("Unable to create WebGL program.");
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "WebGL program link error.");
      }

      gl.useProgram(program);

      const buffer = gl.createBuffer();
      if (!buffer) {
        throw new Error("Unable to create WebGL buffer.");
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW,
      );

      const aPos = gl.getAttribLocation(program, "a_pos");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const texA = uploadTexture(gl, 0, firstImage.image);
      const texB = uploadTexture(gl, 1, secondImage.image);

      gl.uniform1i(gl.getUniformLocation(program, "u_texA"), 0);
      gl.uniform1i(gl.getUniformLocation(program, "u_texB"), 1);

      const uniforms = {
        res: gl.getUniformLocation(program, "u_resolution"),
        texASize: gl.getUniformLocation(program, "u_texASize"),
        texBSize: gl.getUniformLocation(program, "u_texBSize"),
        center: gl.getUniformLocation(program, "u_center"),
        progress: gl.getUniformLocation(program, "u_progress"),
        waveSpeed: gl.getUniformLocation(program, "u_waveSpeed"),
        sigma: gl.getUniformLocation(program, "u_sigma"),
        waveFreq: gl.getUniformLocation(program, "u_waveFreq"),
        pushAmt: gl.getUniformLocation(program, "u_pushAmt"),
        caStrength: gl.getUniformLocation(program, "u_caStrength"),
        glow: gl.getUniformLocation(program, "u_glow"),
        noiseWarp: gl.getUniformLocation(program, "u_noiseWarp"),
        swap: gl.getUniformLocation(program, "u_swap"),
        pinch: gl.getUniformLocation(program, "u_pinch"),
      };

      const state = {
        progress: 0,
        cx: 0.5,
        cy: 0.5,
        swap: 0,
        currentIndex: 0,
        texASize: { width: firstImage.width, height: firstImage.height },
        texBSize: { width: secondImage.width, height: secondImage.height },
        pinch: 0,
      };

      const resize = () => {
        const rect = wrapperElement.getBoundingClientRect();
        const dpr = Math.min(
          window.devicePixelRatio || 1,
          1.75,
          4096 / Math.max(rect.width, 1),
          4096 / Math.max(rect.height, 1),
        );
        const width = Math.max(1, Math.round(rect.width * dpr));
        const height = Math.max(1, Math.round(rect.height * dpr));

        if (canvasElement.width !== width || canvasElement.height !== height) {
          canvasElement.width = width;
          canvasElement.height = height;
          gl.viewport(0, 0, width, height);
        }

        renderRef.current?.();
      };

      const rebindTargetSlot = () => {
        if (loaded.length <= 2) {
          return;
        }

        const nextIndex = (state.currentIndex + 1) % loaded.length;
        const nextImage = loaded[nextIndex]!;
        const targetUnit = state.swap > 0.5 ? 0 : 1;
        const targetTexture = state.swap > 0.5 ? texA : texB;

        gl.activeTexture(gl.TEXTURE0 + targetUnit);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          nextImage.image,
        );

        if (targetUnit === 0) {
          state.texASize = { width: nextImage.width, height: nextImage.height };
        } else {
          state.texBSize = { width: nextImage.width, height: nextImage.height };
        }
      };

      const render = () => {
        const p = paramsRef.current;

        gl.uniform2f(uniforms.res, canvasElement.width, canvasElement.height);
        gl.uniform2f(uniforms.texASize, state.texASize.width, state.texASize.height);
        gl.uniform2f(uniforms.texBSize, state.texBSize.width, state.texBSize.height);
        gl.uniform2f(uniforms.center, state.cx, state.cy);
        gl.uniform1f(uniforms.progress, state.progress);
        gl.uniform1f(uniforms.waveSpeed, p.waveSpeed);
        gl.uniform1f(uniforms.sigma, p.sigma);
        gl.uniform1f(uniforms.waveFreq, p.waveFreq);
        gl.uniform1f(uniforms.pushAmt, p.pushAmt);
        gl.uniform1f(uniforms.caStrength, p.caStrength);
        gl.uniform1f(uniforms.glow, p.glow);
        gl.uniform1f(uniforms.noiseWarp, p.noiseWarp);
        gl.uniform1f(uniforms.swap, state.swap);
        gl.uniform1f(uniforms.pinch, state.pinch);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      renderRef.current = render;

      let animating = false;
      let progressAnim: AnimationPlaybackControls | null = null;
      let pinchAnim: AnimationPlaybackControls | null = null;

      const finish = () => {
        if (!animating) return;
        progressAnim?.stop();
        pinchAnim?.stop();
        state.currentIndex = (state.currentIndex + 1) % loaded.length;
        state.swap = state.swap > 0.5 ? 0 : 1;
        state.progress = 0;
        state.pinch = 0;
        rebindTargetSlot();
        animating = false;
        render();
      };
      settleRef.current = finish;

      const trigger = (cx = 0.5, cy = 0.5) => {
        if (animating || loaded.length < 2 || !activeRef.current) {
          return;
        }

        state.cx = cx;
        state.cy = cy;
        state.progress = 0;
        state.pinch = 0;
        animating = true;
        progressAnim?.stop();
        pinchAnim?.stop();

        if (reducedMotionRef.current) {
          finish();
          return;
        }

        if (paramsRef.current.pinch) {
          pinchAnim = animate(0, [1, 0], {
            duration: 0.5,
            times: [0, 0.2, 1],
            ease: ["easeOut", "easeIn"],
            onUpdate: (value) => {
              state.pinch = value;
              render();
            },
          });
        }

        progressAnim = animate(0, 1, {
          duration: paramsRef.current.duration,
          ease: paramsRef.current.ease,
          onUpdate: (value) => {
            state.progress = value;
            render();
          },
          onComplete: finish,
        });
      };

      triggerRef.current = trigger;

      const handlePointerUp = (event: PointerEvent) => {
        const rect = canvasElement.getBoundingClientRect();
        trigger((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
      };

      const observer = new ResizeObserver(resize);
      observer.observe(wrapperElement);
      window.addEventListener("resize", resize);
      canvasElement.addEventListener("pointerup", handlePointerUp);
      resize();

      cleanup = () => {
        observer.disconnect();
        window.removeEventListener("resize", resize);
        canvasElement.removeEventListener("pointerup", handlePointerUp);
        progressAnim?.stop();
        pinchAnim?.stop();
        triggerRef.current = null;
        settleRef.current = null;
        renderRef.current = null;
        gl.deleteTexture(texA);
        gl.deleteTexture(texB);
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
      };
    }

    setup().catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [images]);

  React.useEffect(() => {
    renderRef.current?.();
  }, [waveSpeed, sigma, waveFreq, pushAmt, caStrength, glow, noiseWarp, pinch]);

  React.useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!activeRef.current || reducedMotionRef.current) return;
      const origin =
        autoPlayOrigin === "random"
          ? { x: 0.18 + Math.random() * 0.64, y: 0.18 + Math.random() * 0.64 }
          : { x: 0.5, y: 0.5 };

      triggerRef.current?.(origin.x, origin.y);
    }, Math.max(500, autoPlayInterval));

    return () => window.clearInterval(interval);
  }, [autoPlay, autoPlayInterval, autoPlayOrigin]);

  if (failed) {
    return (
      <WebGLFallback
        className={className}
        message="Ripple transitions are unavailable in this browser."
      />
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative h-full min-h-[320px] w-full cursor-pointer overflow-hidden leading-none",
        className,
      )}
      style={{ borderRadius, background, touchAction: "manipulation", ...style }}
      {...props}
      role="button"
      tabIndex={images.length < 2 ? -1 : 0}
      aria-label={label}
      aria-disabled={images.length < 2}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          triggerRef.current?.(0.5, 0.5);
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export function RippleTransition(props: RippleTransitionProps) {
  return (
    <WebGLErrorBoundary
      fallback={
        <WebGLFallback
          className={props.className}
          message="Ripple transitions need WebGL, which is unavailable in this browser."
        />
      }
    >
      <RippleTransitionInner {...props} />
    </WebGLErrorBoundary>
  );
}
