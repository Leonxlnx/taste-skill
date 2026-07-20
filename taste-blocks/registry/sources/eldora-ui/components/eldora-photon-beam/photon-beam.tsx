"use client"

import type { CSSProperties } from "react"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js"
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js"

interface Signal {
  mesh: THREE.Line
  laneIndex: number
  speed: number
  progress: number
  history: THREE.Vector3[]
  assignedColor: THREE.Color
}

interface Params {
  colorBg: string
  colorLine: string
  colorSignal: string
  useColor2: boolean
  colorSignal2: string
  useColor3: boolean
  colorSignal3: string
  lineCount: number
  positionX: number
  positionY: number
  spreadHeight: number
  spreadDepth: number
  curveLength: number
  straightLength: number
  curvePower: number
  waveSpeed: number
  waveHeight: number
  lineOpacity: number
  signalCount: number
  speedGlobal: number
  trailLength: number
  bloomStrength: number
  bloomRadius: number
}

export interface PhotonBeamProps {
  colorBg?: string
  colorLine?: string
  colorSignal?: string
  useColor2?: boolean
  colorSignal2?: string
  useColor3?: boolean
  colorSignal3?: string
  lineCount?: number
  spreadHeight?: number
  spreadDepth?: number
  curveLength?: number
  straightLength?: number
  curvePower?: number
  waveSpeed?: number
  waveHeight?: number
  lineOpacity?: number
  signalCount?: number
  speedGlobal?: number
  trailLength?: number
  bloomStrength?: number
  bloomRadius?: number
  className?: string
  style?: CSSProperties
}

const segmentCount = 150

function clamp(value: number, minimum: number, maximum: number, fallback: number) {
  return Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback
}

export default function PhotonBeam({
  colorBg = "#080808",
  colorLine = "#005f6f",
  colorSignal = "#00d9ff",
  useColor2 = false,
  colorSignal2 = "#00ffff",
  useColor3 = false,
  colorSignal3 = "#00b8d4",
  lineCount = 80,
  spreadHeight = 30.33,
  spreadDepth = 0,
  curveLength = 50,
  straightLength = 100,
  curvePower = 0.8265,
  waveSpeed = 2.48,
  waveHeight = 0.145,
  lineOpacity = 0.557,
  signalCount = 94,
  speedGlobal = 0.345,
  trailLength = 3,
  bloomStrength = 3,
  bloomRadius = 0.5,
  className,
  style,
}: PhotonBeamProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) return
    const container: HTMLDivElement = currentContainer

    const params: Params = {
      colorBg,
      colorLine,
      colorSignal,
      useColor2,
      colorSignal2,
      useColor3,
      colorSignal3,
      lineCount: Math.round(clamp(lineCount, 2, 120, 80)),
      positionX: 0,
      positionY: 0,
      spreadHeight: clamp(spreadHeight, 0, 120, 30.33),
      spreadDepth: clamp(spreadDepth, -120, 120, 0),
      curveLength: clamp(curveLength, 1, 240, 50),
      straightLength: clamp(straightLength, 1, 320, 100),
      curvePower: clamp(curvePower, 0.05, 4, 0.8265),
      waveSpeed: clamp(waveSpeed, 0, 12, 2.48),
      waveHeight: clamp(waveHeight, 0, 8, 0.145),
      lineOpacity: clamp(lineOpacity, 0, 1, 0.557),
      signalCount: Math.round(clamp(signalCount, 0, 160, 94)),
      speedGlobal: clamp(speedGlobal, 0, 4, 0.345),
      trailLength: Math.round(clamp(trailLength, 1, 150, 3)),
      bloomStrength: clamp(bloomStrength, 0, 8, 3),
      bloomRadius: clamp(bloomRadius, 0, 1, 0.5),
    }
    params.positionX = (params.curveLength - params.straightLength) / 2

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionQuery.matches
    let inViewport = true
    let pageVisible = document.visibilityState !== "hidden"
    let cancelled = false
    let initializationFrame = 0
    let animationFrame = 0
    let previousFrameTime = 0
    let renderer: THREE.WebGLRenderer | null = null
    let composer: InstanceType<typeof EffectComposer> | null = null
    let resizeObserver: ResizeObserver | null = null
    let intersectionObserver: IntersectionObserver | null = null
    let backgroundMaterial: THREE.LineBasicMaterial | null = null
    let signalMaterial: THREE.LineBasicMaterial | null = null
    let backgroundLines: THREE.Line[] = []
    let signals: Signal[] = []
    let renderFrame: ((time: number, delta: number) => void) | null = null

    function stop() {
      if (animationFrame !== 0) cancelAnimationFrame(animationFrame)
      animationFrame = 0
      previousFrameTime = 0
    }

    function shouldAnimate() {
      return !cancelled && !reducedMotion && inViewport && pageVisible
    }

    function schedule() {
      if (animationFrame === 0 && shouldAnimate()) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    function animate(time: number) {
      animationFrame = 0
      const delta = previousFrameTime
        ? Math.min((time - previousFrameTime) / 1000, 0.05)
        : 1 / 60
      previousFrameTime = time
      renderFrame?.(time / 1000, delta)
      schedule()
    }

    function showStaticFrame() {
      stop()
      renderFrame?.(0, 0)
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches
      if (reducedMotion) showStaticFrame()
      else schedule()
    }

    function handleVisibilityChange() {
      pageVisible = document.visibilityState !== "hidden"
      if (pageVisible) schedule()
      else stop()
    }

    function init() {
      if (cancelled) return
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) {
        initializationFrame = requestAnimationFrame(init)
        return
      }

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(params.colorBg)
      scene.fog = new THREE.FogExp2(params.colorBg, 0.002)

      const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
      camera.position.set(0, 0, 90)
      camera.lookAt(0, 0, 0)

      try {
        renderer = new THREE.WebGLRenderer({ antialias: true })
      } catch {
        return
      }
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.domElement.style.display = "block"
      container.appendChild(renderer.domElement)

      const contentGroup = new THREE.Group()
      contentGroup.position.set(params.positionX, params.positionY, 0)
      scene.add(contentGroup)

      const renderScene = new RenderPass(scene, camera)
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        1.5,
        0.4,
        0.85
      )
      bloomPass.threshold = 0
      bloomPass.strength = params.bloomStrength
      bloomPass.radius = params.bloomRadius

      composer = new EffectComposer(renderer)
      composer.addPass(renderScene)
      composer.addPass(bloomPass)

      function getPathPoint(
        progress: number,
        lineIndex: number,
        time: number
      ) {
        const totalLength = params.curveLength + params.straightLength
        const currentX = -params.curveLength + progress * totalLength
        let y = 0
        let z = 0
        const spreadFactor = (lineIndex / params.lineCount - 0.5) * 2

        if (currentX < 0) {
          const ratio = (currentX + params.curveLength) / params.curveLength
          const shapeFactor = Math.pow(
            (Math.cos(ratio * Math.PI) + 1) / 2,
            params.curvePower
          )
          y = spreadFactor * params.spreadHeight * shapeFactor
          z = spreadFactor * params.spreadDepth * shapeFactor
          y +=
            Math.sin(time * params.waveSpeed + currentX * 0.1 + lineIndex) *
            params.waveHeight *
            shapeFactor
        }

        return new THREE.Vector3(currentX, y, z)
      }

      backgroundMaterial = new THREE.LineBasicMaterial({
        color: params.colorLine,
        transparent: true,
        opacity: params.lineOpacity,
        depthWrite: false,
      })
      signalMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
      })

      const primarySignalColor = new THREE.Color(params.colorSignal)
      const signalColors = [primarySignalColor]
      if (params.useColor2) signalColors.push(new THREE.Color(params.colorSignal2))
      if (params.useColor3) signalColors.push(new THREE.Color(params.colorSignal3))

      function pickSignalColor() {
        return (
          signalColors[Math.floor(Math.random() * signalColors.length)] ??
          primarySignalColor
        )
      }

      function createSignal() {
        if (!signalMaterial) return
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(150 * 3), 3)
        )
        geometry.setAttribute(
          "color",
          new THREE.BufferAttribute(new Float32Array(150 * 3), 3)
        )
        const mesh = new THREE.Line(geometry, signalMaterial)
        mesh.frustumCulled = false
        mesh.renderOrder = 1
        contentGroup.add(mesh)
        signals.push({
          mesh,
          laneIndex: Math.floor(Math.random() * params.lineCount),
          speed: 0.2 + Math.random() * 0.5,
          progress: Math.random(),
          history: [],
          assignedColor: pickSignalColor(),
        })
      }

      for (let index = 0; index < params.lineCount; index += 1) {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(segmentCount * 3), 3)
        )
        const line = new THREE.Line(geometry, backgroundMaterial)
        line.userData = { id: index }
        line.renderOrder = 0
        contentGroup.add(line)
        backgroundLines.push(line)
      }
      for (let index = 0; index < params.signalCount; index += 1) {
        createSignal()
      }

      renderFrame = (time, delta) => {
        for (const line of backgroundLines) {
          const positionAttribute = line.geometry.getAttribute("position")
          if (!(positionAttribute instanceof THREE.BufferAttribute)) continue
          const positions = positionAttribute.array as Float32Array
          const lineId = line.userData.id as number
          for (let index = 0; index < segmentCount; index += 1) {
            const point = getPathPoint(
              index / (segmentCount - 1),
              lineId,
              time
            )
            positions[index * 3] = point.x
            positions[index * 3 + 1] = point.y
            positions[index * 3 + 2] = point.z
          }
          positionAttribute.needsUpdate = true
        }

        for (const signal of signals) {
          signal.progress += signal.speed * delta * params.speedGlobal * 0.3
          if (signal.progress > 1) {
            signal.progress = 0
            signal.laneIndex = Math.floor(Math.random() * params.lineCount)
            signal.history = []
            signal.assignedColor = pickSignalColor()
          }

          signal.history.push(
            getPathPoint(signal.progress, signal.laneIndex, time)
          )
          if (signal.history.length > params.trailLength + 1) {
            signal.history.shift()
          }

          const positionAttribute = signal.mesh.geometry.getAttribute("position")
          const colorAttribute = signal.mesh.geometry.getAttribute("color")
          if (
            !(positionAttribute instanceof THREE.BufferAttribute) ||
            !(colorAttribute instanceof THREE.BufferAttribute)
          ) {
            continue
          }
          const positions = positionAttribute.array as Float32Array
          const colors = colorAttribute.array as Float32Array
          const currentLength = signal.history.length

          for (let index = 0; index < params.trailLength; index += 1) {
            const historyIndex = Math.max(0, currentLength - 1 - index)
            const point = signal.history[historyIndex] ?? new THREE.Vector3()
            const alpha = Math.max(0, 1 - index / params.trailLength)
            positions[index * 3] = point.x
            positions[index * 3 + 1] = point.y
            positions[index * 3 + 2] = point.z
            colors[index * 3] = signal.assignedColor.r * alpha
            colors[index * 3 + 1] = signal.assignedColor.g * alpha
            colors[index * 3 + 2] = signal.assignedColor.b * alpha
          }

          signal.mesh.geometry.setDrawRange(0, params.trailLength)
          positionAttribute.needsUpdate = true
          colorAttribute.needsUpdate = true
        }

        composer?.render()
      }

      function resize() {
        const nextWidth = container.clientWidth
        const nextHeight = container.clientHeight
        if (
          nextWidth === 0 ||
          nextHeight === 0 ||
          !renderer ||
          !composer
        ) {
          return
        }
        camera.aspect = nextWidth / nextHeight
        camera.updateProjectionMatrix()
        renderer.setSize(nextWidth, nextHeight)
        composer.setSize(nextWidth, nextHeight)
        if (reducedMotion) showStaticFrame()
      }

      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      intersectionObserver = new IntersectionObserver(([entry]) => {
        inViewport = entry?.isIntersecting ?? false
        if (inViewport) schedule()
        else stop()
      })
      intersectionObserver.observe(container)

      if (reducedMotion) showStaticFrame()
      else schedule()
    }

    motionQuery.addEventListener("change", handleMotionChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    initializationFrame = requestAnimationFrame(init)

    return () => {
      cancelled = true
      cancelAnimationFrame(initializationFrame)
      stop()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      motionQuery.removeEventListener("change", handleMotionChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      for (const line of backgroundLines) line.geometry.dispose()
      for (const signal of signals) signal.mesh.geometry.dispose()
      backgroundLines = []
      signals = []
      backgroundMaterial?.dispose()
      signalMaterial?.dispose()
      composer?.dispose()
      if (renderer) {
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement)
        }
        renderer.dispose()
        renderer.forceContextLoss()
      }
    }
  }, [
    colorBg,
    colorLine,
    colorSignal,
    useColor2,
    colorSignal2,
    useColor3,
    colorSignal3,
    lineCount,
    spreadHeight,
    spreadDepth,
    curveLength,
    straightLength,
    curvePower,
    waveSpeed,
    waveHeight,
    lineOpacity,
    signalCount,
    speedGlobal,
    trailLength,
    bloomStrength,
    bloomRadius,
  ])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`h-full min-h-50 w-full overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: colorBg, ...style }}
    />
  )
}
