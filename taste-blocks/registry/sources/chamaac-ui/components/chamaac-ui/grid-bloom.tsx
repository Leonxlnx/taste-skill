"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 uColor;
uniform float uSpeed;
uniform float uGridScale;
uniform float uRotationSpeed;
uniform float uFadeFalloff;
uniform float uDistortionAmount;
uniform float uFlowSpeedX;
uniform float uFlowSpeedY;
uniform float uHoverRepulsionRadius;
uniform float uHoverRepulsionStrength;
uniform float uHoverLightRadius;
uniform float uMouseActive;
uniform vec2 iMouse;
varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+10.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.792843 - 0.853735 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 unrotatedP = (fragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;

    // Mouse math (distance in unrotated screen space)
    vec2 mouseP = (iMouse.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec2 mouseDir = unrotatedP - mouseP;
    float mouseDist = length(mouseDir);
    float mouseInfluence = smoothstep(uHoverRepulsionRadius, 0.0, mouseDist) * uMouseActive;

    // Apply soft rotation
    float rot = iTime * uRotationSpeed * 0.3;
    mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
    vec2 p = m * unrotatedP;

    // Organic fluid distortion
    float noiseDist = snoise(p * 1.5 + iTime * uSpeed * 0.15);
    vec2 distortedPos = p + vec2(noiseDist * uDistortionAmount);

    // Mouse lens distortion (push grid away from mouse fluidly)
    vec2 rotatedMouseDir = m * mouseDir;
    distortedPos += rotatedMouseDir * mouseInfluence * uHoverRepulsionStrength;

    // Apply grid scaling
    vec2 gridPos = distortedPos * uGridScale;

    // Flowing motion
    gridPos.x += iTime * uSpeed * uFlowSpeedX;
    gridPos.y += iTime * uSpeed * uFlowSpeedY;

    vec2 cell = fract(gridPos);
    vec2 cellCenter = abs(cell - 0.5);

    // Modern glowing lines: thin and smooth
    float lineWidth = 0.015;
    float smoothEdge = 0.03;
    vec2 lines = smoothstep(0.5 - lineWidth - smoothEdge, 0.5 - lineWidth, cellCenter);
    float gridAlpha = max(lines.x, lines.y);

    // Add pulsing node intersections
    float intersections = lines.x * lines.y;

    // Randomized glowing orbs at some intersections
    float glowMask = snoise(floor(gridPos) * 0.4 + iTime * uSpeed * 0.4);
    float glow = smoothstep(0.2, 0.5, cellCenter.x) * smoothstep(0.2, 0.5, cellCenter.y);
    glow *= smoothstep(0.3, 0.8, glowMask);

    // Elegant moire/interference pulse
    float pulseDist = length(p);
    float pulse = 0.5 + 0.5 * sin(pulseDist * 8.0 - iTime * uSpeed * 1.5 + noiseDist * 2.0);

    // Assemble the bloom layers
    float finalAlpha = (gridAlpha * 0.3) + (intersections * 0.8) + (glow * 0.6);

    // Airborne brightness modulation
    finalAlpha *= (0.6 + 0.4 * snoise(p * 4.0 - iTime * uSpeed * 0.5));
    finalAlpha += finalAlpha * pulse * 0.4;

    // Mouse glow interaction
    float mouseGlow = smoothstep(uHoverLightRadius, 0.0, mouseDist) * 0.6 * uMouseActive;
    finalAlpha += mouseGlow * gridAlpha; // Illuminate the grid directly

    // Sophisticated vignette fading
    float vignette = 1.0 - smoothstep(0.1, uFadeFalloff, pulseDist);

    // Overall ambient breathing breathing
    float breathing = 0.8 + 0.2 * sin(iTime * uSpeed * 0.8);

    fragColor = vec4(uColor, clamp(finalAlpha * vignette * breathing, 0.0, 1.0));
}

void main() {
    mainImage(gl_FragColor, vUv * iResolution);
}
`;

interface ShaderPlaneProps {
  color: string;
  speed: number;
  gridScale: number;
  rotationSpeed: number;
  fadeFalloff: number;
  distortionAmount: number;
  flowSpeedX: number;
  flowSpeedY: number;
  hoverLightRadius: number;
  hoverRepulsionRadius: number;
  hoverRepulsionStrength: number;
  enableMouseInteraction: boolean;
}

const ShaderPlane = ({
  color,
  speed,
  gridScale,
  rotationSpeed,
  fadeFalloff,
  distortionAmount,
  flowSpeedX,
  flowSpeedY,
  hoverLightRadius,
  hoverRepulsionRadius,
  hoverRepulsionStrength,
  enableMouseInteraction,
}: ShaderPlaneProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const gl = useThree((s) => s.gl);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: 0,
    targetActive: 0,
  });

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      iMouse: { value: new THREE.Vector2(-1000, -1000) },
      uMouseActive: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: speed },
      uGridScale: { value: gridScale },
      uRotationSpeed: { value: rotationSpeed },
      uFadeFalloff: { value: fadeFalloff },
      uDistortionAmount: { value: distortionAmount },
      uFlowSpeedX: { value: flowSpeedX },
      uFlowSpeedY: { value: flowSpeedY },
      uHoverLightRadius: { value: hoverLightRadius },
      uHoverRepulsionRadius: { value: hoverRepulsionRadius },
      uHoverRepulsionStrength: { value: hoverRepulsionStrength },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    uniforms.uColor.value.set(color);
  }, [color, uniforms]);
  useEffect(() => {
    uniforms.uSpeed.value = speed;
  }, [speed, uniforms]);
  useEffect(() => {
    uniforms.uGridScale.value = gridScale;
  }, [gridScale, uniforms]);
  useEffect(() => {
    uniforms.uRotationSpeed.value = rotationSpeed;
  }, [rotationSpeed, uniforms]);
  useEffect(() => {
    uniforms.uFadeFalloff.value = fadeFalloff;
  }, [fadeFalloff, uniforms]);
  useEffect(() => {
    uniforms.uDistortionAmount.value = distortionAmount;
  }, [distortionAmount, uniforms]);
  useEffect(() => {
    uniforms.uFlowSpeedX.value = flowSpeedX;
  }, [flowSpeedX, uniforms]);

  useEffect(() => {
    uniforms.uFlowSpeedY.value = flowSpeedY;
  }, [flowSpeedY, uniforms]);
  useEffect(() => {
    uniforms.uHoverLightRadius.value = hoverLightRadius;
  }, [hoverLightRadius, uniforms]);
  useEffect(() => {
    uniforms.uHoverRepulsionRadius.value = hoverRepulsionRadius;
  }, [hoverRepulsionRadius, uniforms]);
  useEffect(() => {
    uniforms.uHoverRepulsionStrength.value = hoverRepulsionStrength;
  }, [hoverRepulsionStrength, uniforms]);

  useEffect(() => {
    if (!enableMouseInteraction) {
      mouseRef.current.targetActive = 0;
      mouseRef.current.active = 0;
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      mouseRef.current.targetActive = inside ? 1 : 0;

      if (inside) {
        mouseRef.current.targetX = e.clientX - rect.left;
        mouseRef.current.targetY = rect.bottom - e.clientY;
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.targetActive = 0;
    };

    window.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [gl.domElement, enableMouseInteraction]);

  useFrame((state) => {
    if (materialRef.current) {
      // Smooth mouse interpolation (spring-like physics follow)
      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      // Faster fade out physics for the light
      mouseRef.current.active +=
        (mouseRef.current.targetActive - mouseRef.current.active) * 0.15;

      materialRef.current.uniforms.iTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.iResolution.value.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );
      materialRef.current.uniforms.iMouse.value.set(
        mouseRef.current.x * state.viewport.dpr,
        mouseRef.current.y * state.viewport.dpr
      );
      materialRef.current.uniforms.uMouseActive.value = mouseRef.current.active;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      {/* eslint-disable react/no-unknown-property */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent={true}
        blending={THREE.AdditiveBlending}
      />
      {/* eslint-enable react/no-unknown-property */}
    </mesh>
  );
};

export interface GridBloomProps {
  className?: string;
  /** Bloom color */
  color?: string;
  /** Overall animation speed multiplier */
  speed?: number;
  /** Density of the grid (higher = more tiles) */
  gridScale?: number;
  /** Speed of the slow grid rotation */
  rotationSpeed?: number;
  /** Controls how quickly the bloom fades out to the edges. Default: 10.0. Lower = sharper fade. Higher = softer/no fade. */
  fadeFalloff?: number;
  /** Amount of noise-based distortion applied to the grid lines. Default: 0.08. Setting to 0.0 gives rigid, straight lines. */
  distortionAmount?: number;
  /** Horizontal scrolling speed of the grid. Default: -0.2 */
  flowSpeedX?: number;
  /** Vertical scrolling speed of the grid. Default: -0.4 */
  flowSpeedY?: number;
  /** Radius of the light illumination under the mouse. Default: 0.5. Higher = larger light aura. */
  hoverLightRadius?: number;
  /** Radius of the structural push effect from the mouse. Default: 0.6. */
  hoverRepulsionRadius?: number;
  /** Strength of the geometric push effect from the mouse. Default: 0.3. Setting to 0.0 disables the warp. */
  hoverRepulsionStrength?: number;
  /** Whether mouse hover interaction (light aura + repulsion) is enabled. Default: true. */
  enableMouseInteraction?: boolean;
}

export default function GridBloom({
  className,
  color = "#e040fb",
  speed = 1.0,
  gridScale = 12.0,
  rotationSpeed = 0.0,
  fadeFalloff = 10.0,
  distortionAmount = 0.05,
  flowSpeedX = -0.2,
  flowSpeedY = -0.4,
  hoverLightRadius = 0.5,
  hoverRepulsionRadius = 1.0,
  hoverRepulsionStrength = 0.6,
  enableMouseInteraction = true,
}: GridBloomProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full h-full absolute inset-0 pointer-events-none",
        className
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5]}
        frameloop={reduceMotion ? "demand" : "always"}
      >
        <ShaderPlane
          color={color}
          speed={speed}
          gridScale={gridScale}
          rotationSpeed={rotationSpeed}
          fadeFalloff={fadeFalloff}
          distortionAmount={distortionAmount}
          flowSpeedX={flowSpeedX}
          flowSpeedY={flowSpeedY}
          hoverLightRadius={hoverLightRadius}
          hoverRepulsionRadius={hoverRepulsionRadius}
          hoverRepulsionStrength={hoverRepulsionStrength}
          enableMouseInteraction={enableMouseInteraction && !reduceMotion}
        />
      </Canvas>
    </div>
  );
}
