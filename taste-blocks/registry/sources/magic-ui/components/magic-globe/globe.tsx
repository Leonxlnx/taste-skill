"use client"

import { useEffect, useRef } from "react"
import createGlobe, { type COBEOptions } from "cobe"
import { useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "../../lib/utils"

const MOVEMENT_DAMPING = 1400
const MAX_DEVICE_PIXEL_RATIO = 2
const MAX_RENDER_SIZE = 1200

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
  ariaLabel = "Interactive globe",
}: {
  className?: string
  config?: COBEOptions
  ariaLabel?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const devicePixelRatioRef = useRef(1)
  const renderSizeRef = useRef(1)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const shouldReduceMotion = useReducedMotion()

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const updatePointerInteraction = (value: number | null) => {
    if (shouldReduceMotion) return
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (shouldReduceMotion) return
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let fadeTimer: number | undefined
    let globe: ReturnType<typeof createGlobe> | null = null
    let isInView = false

    const measure = () => {
      const cssSize = Math.max(
        1,
        Math.min(canvas.clientWidth, canvas.clientHeight || canvas.clientWidth)
      )
      devicePixelRatioRef.current = Math.min(
        MAX_DEVICE_PIXEL_RATIO,
        Math.max(
          1,
          Math.min(window.devicePixelRatio || 1, config.devicePixelRatio || 1)
        )
      )
      renderSizeRef.current = Math.min(
        MAX_RENDER_SIZE,
        Math.max(1, Math.round(cssSize * devicePixelRatioRef.current))
      )
    }

    const stop = () => {
      if (fadeTimer !== undefined) window.clearTimeout(fadeTimer)
      fadeTimer = undefined
      canvas.style.opacity = "0"
      pointerInteracting.current = null
      canvas.style.cursor = shouldReduceMotion ? "default" : "grab"
      globe?.destroy()
      globe = null
    }

    const start = () => {
      if (globe) return
      measure()
      globe = createGlobe(canvas, {
        ...config,
        devicePixelRatio: devicePixelRatioRef.current,
        width: renderSizeRef.current,
        height: renderSizeRef.current,
        onRender: (state) => {
          if (!shouldReduceMotion && pointerInteracting.current === null) {
            phiRef.current += 0.005
          }
          state.phi = phiRef.current + rs.get()
          state.width = renderSizeRef.current
          state.height = renderSizeRef.current
        },
      })

      fadeTimer = window.setTimeout(() => {
        canvas.style.opacity = "1"
      }, 0)
    }

    const sync = () => {
      if (isInView && document.visibilityState === "visible") start()
      else stop()
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(canvas)

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting
      sync()
    })
    intersectionObserver.observe(canvas)

    document.addEventListener("visibilitychange", sync)

    return () => {
      document.removeEventListener("visibilitychange", sync)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      stop()
    }
  }, [rs, config, shouldReduceMotion])

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-square w-full max-w-150",
        className
      )}
    >
      <canvas
        role="img"
        aria-label={ariaLabel}
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 contain-[layout_paint_size] motion-reduce:transition-none"
        )}
        ref={canvasRef}
        onPointerDown={(e) => updatePointerInteraction(e.clientX)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerCancel={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
