"use client";

import React, { useEffect, useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { cn } from "./lib/utils";

export interface LightSpeedProps {
  /**
   * Number of particles (stars/lines).
   * @default 2000
   */
  particleCount?: number;
  /**
   * Base speed of the warp effect.
   * @default 4
   */
  speed?: number;
  /**
   * Base color of the emitted light streaks.
   * @default "#33b2ff"
   */
  lightColor?: string;
  /**
   * Intensity of the bloom glow.
   * @default 3.0
   */
  intensity?: number;
  /**
   * Extent of the cylinder radius in which particles spawn.
   * @default 25
   */
  radius?: number;
  /**
   * Length of the cylinder before particles loop back.
   * @default 150
   */
  cylinderLength?: number;
  className?: string;
}

function Particles({
  count,
  baseSpeed,
  lightColor,
  intensity,
  radius,
  cylinderLength,
}: {
  count: number;
  baseSpeed: number;
  lightColor: string;
  intensity: number;
  radius: number;
  cylinderLength: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Object3D to help apply transforms to individual instanced items
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize particle properties
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Start further away from the center to leave a "tunnel" for the camera
      const r = 2 + Math.random() * (radius - 2);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      let z = (Math.random() - 0.5) * cylinderLength;
      let speedMultiplier = 0.5 + Math.random() * 0.5;

      // Pre-warm the particle simulation by 1.5 seconds
      for (let j = 0; j < 90; j++) {
        z += baseSpeed * speedMultiplier * (1 / 60) * 50;
        if (z > 5) {
          z = -cylinderLength / 2;
          speedMultiplier = 0.5 + Math.random() * 0.5;
        }
      }

      temp.push({
        x,
        y,
        z,
        // Individual random speed multiplier to give depth variation
        speedMultiplier,
        // Individual random length to look more organic
        length: 1 + Math.random() * 2,
        angle,
        radius: r,
      });
    }
    return temp;
  }, [count, radius, cylinderLength]);

  const bloomColor = useMemo(() => {
    const color = new THREE.Color(lightColor);
    color.multiplyScalar(intensity);
    return color;
  }, [lightColor, intensity]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // We update each particle's matrix and apply rotation/translation
    particles.forEach((particle, i) => {
      // Move particle towards the camera (+Z)
      // delta makes the movement frame-rate independent.
      const moveDistance = baseSpeed * particle.speedMultiplier * delta * 50;
      particle.z += moveDistance;

      // If a particle passes the camera (z > 5), loop it back to the far end
      if (particle.z > 5) {
        particle.z = -cylinderLength / 2;
        particle.speedMultiplier = 0.5 + Math.random() * 0.5;
      }

      // We place the dummy at the particle coordinates
      dummy.position.set(particle.x, particle.y, particle.z);
      // We scale the length on the Z-axis to mimic motion blur/stretched UV spheres
      // The faster it moves, the more stretched it appears
      const stretchZ =
        particle.length + baseSpeed * particle.speedMultiplier * 0.5;
      // X and Y are scaled small to look thin (like streaks)
      dummy.scale.set(0.04, 0.04, stretchZ);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    // Tell Three.js the matrix data has been updated and deserves a re-render
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color={bloomColor}
        toneMapped={false}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

export function LightSpeed({
  particleCount = 1000,
  speed = 2.4,
  lightColor = "#b026ff",
  intensity = 3.0,
  radius = 25,
  cylinderLength = 150,
  className,
}: LightSpeedProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const safeParticleCount = Math.min(
    Math.max(Math.floor(particleCount), 1),
    4000
  );

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
        "absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#05070b]",
        className
      )}
    >
      {/*
        Camera looks down -Z axis. FOV 90 for a wider warping look.
        It simulates a camera traveling in a cylinder (as per the Ducky3D video).
      */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 90 }}
        dpr={[1, 1.5]}
        frameloop={reduceMotion ? "demand" : "always"}
      >
        {/* The fog acts as the "Volume cube" from the tutorial to fade out clipping edges in the distance */}
        <fogExp2 attach="fog" args={["#000000", 0.025]} />
        <color attach="background" args={["#000000"]} />

        <Particles
          count={safeParticleCount}
          baseSpeed={speed}
          lightColor={lightColor}
          intensity={intensity}
          radius={radius}
          cylinderLength={cylinderLength}
        />

        <EffectComposer>
          {/* Bloom takes any value > 1 and makes it emit a neon outer glow */}
          <Bloom
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            intensity={1.5}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default LightSpeed;
