"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { cn } from "./lib/utils";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uFlowMin;
  uniform float uFlowMax;

  varying vec2 vUv;

  // Modern Simplex/Perlin Noise Hash for smooth wispy smoke
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
  }

  // Fractional Brownian Motion (fbm) to create wispy fractal smoke
  float fbm(vec2 x) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // Rotate to add spiral variation
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
      for (int i = 0; i < 5; ++i) { // Restored to 5 layers for maximum elegance and detail
          v += a * snoise(x);
          x = rot * x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  void main() {
      // Fix aspect ratio for smooth scaling
      vec2 uv = vUv;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= uResolution.x / uResolution.y;

      // Map the sine wave (-1 to 1) to the desired flow range (uFlowMin to uFlowMax)
      float midpoint = (uFlowMax + uFlowMin) / 2.0;
      float amplitude = (uFlowMax - uFlowMin) / 2.0;

      // Oscillate structure time to prevent radial stretching (starts at uFlowMin)
      float flowTime = (midpoint + amplitude * sin(uTime * 0.5 - 1.5708)) * 0.25;

      // Endlessly rotating drift to keep smoke fresh without math precision breakdown
      // By using a trig function rather than linear addition, coordinates never exceed float16 bounds!
      vec2 drift = vec2(sin(uTime * 0.15), cos(uTime * 0.15));

      // Soft radial flow outward from center (averts sharp pinch singularity)
      float radius = length(p);
      vec2 dir = p / (radius + 0.1);

      // Primary Flow (breathing outwards and inwards smoothly)
      vec2 q = vec2(0.);
      q.x = fbm( p - dir * flowTime );
      q.y = fbm( p - dir * flowTime + vec2(1.0));

      // Secondary Flow (whispy detail pushing through the smoke continuously)
      vec2 r = vec2(0.);
      r.x = fbm( p + 1.0 * q + vec2(1.7, 9.2) - dir * flowTime * 0.8 + drift );
      r.y = fbm( p + 1.0 * q + vec2(8.3, 2.8) - dir * flowTime * 0.6 + drift );

      // Final Shape Density Map
      float f = fbm(p + r);

      // Color mapping mixing based on density depth
      vec3 color = mix(
          uColor1, // Darkest base
          uColor2, // Mid-tone
          clamp((f * f) * 4.0, 0.0, 1.0)
      );

      color = mix(
          color,
          uColor3, // High-light wisps
          clamp(length(q), 0.0, 1.0)
      );

      // Enhance the wispy brightness dynamically
      color += uColor3 * (f * f * f * 1.5) * 0.;

      // Darken edges slightly for vignette
      float vignette = length(uv - 0.5);
      color = mix(color, vec3(0.0), smoothstep(0.4, 1.5, vignette));

      // Atmospheric fade-in depth
      float opacity = smoothstep(0.1, 0.9, f + 0.4);

      gl_FragColor = vec4(color, opacity);
  }
`;

interface AstralFlowProps {
  className?: string;
  speed?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  flowMin?: number;
  flowMax?: number;
}

const Effect = ({
  speed,
  color1,
  color2,
  color3,
  flowMin,
  flowMax,
}: Required<Omit<AstralFlowProps, "className">>) => {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uColor1: { value: new THREE.Color(color1) },
      uColor2: { value: new THREE.Color(color2) },
      uColor3: { value: new THREE.Color(color3) },
      uFlowMin: { value: flowMin },
      uFlowMax: { value: flowMax },
    }),
    [] // Initialize only once to prevent shader recreation
  );

  // Smoothly update uniform values
  useEffect(() => {
    if (material.current) {
      material.current.uniforms.uColor1.value.set(color1);
      material.current.uniforms.uColor2.value.set(color2);
      material.current.uniforms.uColor3.value.set(color3);
      material.current.uniforms.uFlowMin.value = flowMin;
      material.current.uniforms.uFlowMax.value = flowMax;
    }
  }, [color1, color2, color3, flowMin, flowMax]);

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value =
        (state.clock.getElapsedTime() * speed) % (40 * Math.PI);
      material.current.uniforms.uResolution.value.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};

export default function AstralFlow({
  className,
  speed = 1.5,
  color1 = "#05070a", // Deep void blue-black
  color2 = "#2e1a38", // Moody dark plum/purple
  color3 = "#a0769a", // Glowing ethereal mauve/silver
  flowMin = 3.0,
  flowMax = 7.0,
}: AstralFlowProps) {
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
        "absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#05070a]",
        className
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={1}
        frameloop={reduceMotion ? "demand" : "always"}
      >
        <Effect
          speed={speed}
          color1={color1}
          color2={color2}
          color3={color3}
          flowMin={flowMin}
          flowMax={flowMax}
        />
      </Canvas>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
