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
  uniform vec3 uColor;
  uniform float uSpeed;
  uniform float uDetail;
  uniform float uDistortion;
  uniform float uBrightness;
  varying vec2 vUv;

  #define time uTime * 0.2

  mat2 makem2(in float theta){
      float c = cos(theta);
      float s = sin(theta);
      return mat2(c,-s,s,c);
  }

  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise( in vec2 x, float detail ){
      x *= detail;
      vec2 p = floor(x);
      vec2 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(p + vec2(0.0, 0.0));
      float b = hash(p + vec2(1.0, 0.0));
      float c = hash(p + vec2(0.0, 1.0));
      float d = hash(p + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  mat2 m2 = mat2( 0.80,  0.60, -0.60,  0.80 );

  float fbm( in vec2 p, float detail, int octaves )
  {
      float z=2.;
      float rz = 0.;
      for (int i= 0; i < 7; i++ )
      {
          if(i >= octaves) break;
          rz += abs((noise(p, detail)-0.5)*4.)/z;
          z = z*2.;
          p = p*2.;
          p *= m2;
      }
      return rz;
  }

 void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= uResolution.x/uResolution.y;
    vec2 bp = p;
    p += 5.;
    p *= 0.5;

    float rb = fbm(p*.5 + time*.17, uDetail, 3) * .1;
    // rb = sqrt(rb);
    p *= makem2(rb*.2 + atan(p.y,p.x) * uDistortion);

    float rz = fbm(p*.9 - time*.7, uDetail, 5);

    rz *= 12.0;

    rz *= abs(sin(bp.x*0.5 - time*4.0 - 2.0)) * 1.0;

    vec3 col = uColor / (uBrightness - rz);

    gl_FragColor = vec4(sqrt(abs(col)), 1.0);
}
`;

interface ElectricMistProps {
  className?: string;
  speed?: number;
  color?: string;
  detail?: number;
  distortion?: number;
  brightness?: number;
}

const Effect = ({
  speed,
  color,
  detail,
  distortion,
  brightness,
}: Required<Omit<ElectricMistProps, "className">>) => {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: speed },
      uDetail: { value: detail },
      uDistortion: { value: distortion },
      uBrightness: { value: brightness },
    }),
    []
  );

  useEffect(() => {
    if (material.current) {
      material.current.uniforms.uColor.value.set(color);
      material.current.uniforms.uSpeed.value = speed;
      material.current.uniforms.uDetail.value = detail;
      material.current.uniforms.uDistortion.value = distortion;
      material.current.uniforms.uBrightness.value = brightness;
    }
  }, [color, speed, detail, distortion, brightness]);

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value =
        state.clock.getElapsedTime() * speed;
      material.current.uniforms.uResolution.value.set(
        state.size.width,
        state.size.height
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
      />
    </mesh>
  );
};

export default function ElectricMist({
  className,
  speed = 1.0,
  color = "#191970",
  detail = 1.5,
  distortion = 3.0,
  brightness = 1.0,
}: ElectricMistProps) {
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
        "absolute inset-0 w-full h-full pointer-events-none bg-[#05050f] overflow-hidden",
        className
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 1] }}
        dpr={1}
        frameloop={reduceMotion ? "demand" : "always"}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Effect
          speed={speed}
          color={color}
          detail={detail}
          distortion={distortion}
          brightness={brightness}
        />
      </Canvas>
    </div>
  );
}
