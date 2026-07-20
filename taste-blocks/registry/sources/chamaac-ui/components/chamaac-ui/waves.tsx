"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  Canvas,
  useFrame,
  extend,
  ThreeElement,
  useThree,
} from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import { cn } from "./lib/utils";

const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    vec4 j = p - 49.0 * floor(p * (1.0/49.0));
    vec4 x_ = floor(j * (1.0/7.0));
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * (1.0/7.0) + 0.5/7.0;
    vec4 y = y_ * (1.0/7.0) + 0.5/7.0;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const WavesMaterial = shaderMaterial(
  {
    u_time: 0,
    u_color_1: new THREE.Color("#071697"),
    u_color_2: new THREE.Color("#00d4ff"),
    u_color_3: new THREE.Color("#000000"),
    u_speed_x: 0.1,
    u_speed_y: 0.1,
    u_amp: 1.5,
    u_noise_freq: 0.2,
  },
  // Vertex Shader
  NOISE_GLSL +
    `
  varying float vNoise;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_speed_x;
  uniform float u_speed_y;
  uniform float u_amp;
  uniform float u_noise_freq;

  void main() {
    vUv = uv;

    // Directional flow
    vec3 noisePos = vec3(position.xy * u_noise_freq - vec2(u_time * u_speed_x, 0.0), u_time * u_speed_y);

    float noise = snoise(noisePos);
    vNoise = noise;

    vec3 pos = position;
    pos.z += noise * u_amp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
  `,
  // Fragment Shader
  `
  varying vec2 vUv;
  varying float vNoise;
  uniform vec3 u_color_1;
  uniform vec3 u_color_2;
  uniform vec3 u_color_3;

  void main() {
    float n = vNoise * 0.5 + 0.5;

    vec3 color;

    // Low (Valley) -> Mid -> High (Peak)
    if (n < 0.5) {
      color = mix(u_color_3, u_color_1, smoothstep(0.0, 0.5, n));
    } else {
      color = mix(u_color_1, u_color_2, smoothstep(0.6, 1.0, n));
    }

    gl_FragColor = vec4(color, 1.0);
  }
  `
);

extend({ WavesMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    wavesMaterial: ThreeElement<typeof WavesMaterial>;
  }
}

function Scene({
  waveColor1,
  waveColor2,
  waveColor3,
  waveSpeedX,
  waveSpeedY,
  waveAmpX,
}: {
  waveColor1: string;
  waveColor2: string;
  waveColor3: string;
  waveSpeedX: number;
  waveSpeedY: number;
  waveAmpX: number;
}) {
  const matRef = useRef<
    THREE.ShaderMaterial & {
      u_time: number;
      u_color_1: THREE.Color;
      u_color_2: THREE.Color;
      u_color_3: THREE.Color;
      u_speed_x: number;
      u_speed_y: number;
      u_amp: number;
      u_noise_freq: number;
    }
  >(null);

  const { viewport } = useThree();

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.u_time = state.clock.getElapsedTime();
      matRef.current.u_color_1.set(waveColor1);
      matRef.current.u_color_2.set(waveColor2);
      matRef.current.u_color_3.set(waveColor3);
      matRef.current.u_speed_x = waveSpeedX;
      matRef.current.u_speed_y = waveSpeedY;
      matRef.current.u_amp = (waveAmpX / 32.0) * 1.5;
      // Hardcoded freq for now as xGap is removed
      matRef.current.u_noise_freq = 0.25;
    }
  });

  const planeArgs = useMemo<[number, number, number, number]>(
    () => [viewport.width * 1.5, viewport.height * 1.5, 128, 128],
    [viewport.width, viewport.height]
  );

  return (
    <mesh rotation={[-0.2, 0, 0]}>
      <planeGeometry args={planeArgs} />
      <wavesMaterial ref={matRef} key={WavesMaterial.key} transparent={false} />
    </mesh>
  );
}

interface WavesProps {
  className?: string;
  backgroundColor?: string;
  waveColor1?: string;
  waveColor2?: string;
  waveColor3?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
}

export function Waves({
  className,
  backgroundColor = "#000000",
  waveColor1 = "#071697",
  waveColor2 = "#00d4ff",
  waveColor3 = "#000000",
  waveSpeedX = 0.0125,
  waveSpeedY = 0.005,
  waveAmpX = 32,
}: WavesProps) {
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
        "absolute inset-0 w-full h-full pointer-events-none z-0",
        className
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 4] }}
        dpr={[1, 1.5]}
        frameloop={reduceMotion ? "demand" : "always"}
      >
        <color attach="background" args={[backgroundColor]} />
        <Scene
          waveColor1={waveColor1}
          waveColor2={waveColor2}
          waveColor3={waveColor3}
          waveSpeedX={waveSpeedX * 10.0}
          waveSpeedY={waveSpeedY * 10.0}
          waveAmpX={waveAmpX}
        />
      </Canvas>
    </div>
  );
}

export default Waves;
