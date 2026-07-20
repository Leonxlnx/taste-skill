"use client"

import type { HTMLAttributes } from "react"
import { useEffect, useRef } from "react"
import { Color, Mesh, Program, Renderer, Triangle } from "ogl"

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`

const defaultColor: [number, number, number] = [1, 1, 1]

export interface NovatrixProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  color?: [number, number, number]
  speed?: number
  amplitude?: number
  mouseReact?: boolean
}

function clamp(value: number, minimum: number, maximum: number, fallback: number) {
  return Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, value))
    : fallback
}

export default function Novatrix({
  color = defaultColor,
  speed = 1,
  amplitude = 0.1,
  mouseReact = false,
  className,
  style,
  ...rest
}: NovatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const red = clamp(color[0], 0, 1, 1)
  const green = clamp(color[1], 0, 1, 1)
  const blue = clamp(color[2], 0, 1, 1)
  const safeSpeed = clamp(speed, 0, 4, 1)
  const safeAmplitude = clamp(amplitude, 0, 1, 0.1)
  const fallbackColor = `rgb(${Math.round(red * 255)} ${Math.round(green * 255)} ${Math.round(blue * 255)})`

  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) return
    const container: HTMLDivElement = currentContainer

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionQuery.matches
    let pageVisible = document.visibilityState !== "hidden"
    let inViewport = true
    let animationFrame = 0
    let renderer: Renderer | null = null
    let resizeObserver: ResizeObserver | null = null
    let intersectionObserver: IntersectionObserver | null = null

    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
    } catch {
      return
    }

    const gl = renderer.gl
    gl.clearColor(red, green, blue, 1)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(red, green, blue) },
        uResolution: {
          value: new Color(1, 1, 1),
        },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uAmplitude: { value: safeAmplitude },
        uSpeed: { value: safeSpeed },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    function render(time: number) {
      program.uniforms.uTime.value = time * 0.001
      renderer?.render({ scene: mesh })
    }

    function shouldAnimate() {
      return !reducedMotion && pageVisible && inViewport
    }

    function schedule() {
      if (animationFrame === 0 && shouldAnimate()) {
        animationFrame = requestAnimationFrame(frame)
      }
    }

    function frame(time: number) {
      animationFrame = 0
      render(time)
      schedule()
    }

    function stop() {
      if (animationFrame !== 0) cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }

    function resize() {
      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0 || !renderer) return
      renderer.setSize(width, height)
      program.uniforms.uResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      )
      render(reducedMotion ? 0 : performance.now())
    }

    function handlePointerMove(event: PointerEvent) {
      if (!mouseReact || reducedMotion) return
      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      program.uniforms.uMouse.value[0] = (event.clientX - rect.left) / rect.width
      program.uniforms.uMouse.value[1] =
        1 - (event.clientY - rect.top) / rect.height
    }

    function handleMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches
      if (reducedMotion) {
        stop()
        render(0)
      } else {
        schedule()
      }
    }

    function handleVisibilityChange() {
      pageVisible = document.visibilityState !== "hidden"
      if (pageVisible) schedule()
      else stop()
    }

    gl.canvas.style.display = "block"
    container.appendChild(gl.canvas)
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    intersectionObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry?.isIntersecting ?? false
      if (inViewport) schedule()
      else stop()
    })
    intersectionObserver.observe(container)

    if (mouseReact) container.addEventListener("pointermove", handlePointerMove)
    motionQuery.addEventListener("change", handleMotionChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    resize()
    render(0)
    schedule()

    return () => {
      stop()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      if (mouseReact) {
        container.removeEventListener("pointermove", handlePointerMove)
      }
      motionQuery.removeEventListener("change", handleMotionChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (gl.canvas.parentElement === container) container.removeChild(gl.canvas)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [red, green, blue, safeSpeed, safeAmplitude, mouseReact])

  return (
    <div
      {...rest}
      ref={containerRef}
      aria-hidden="true"
      className={`h-full w-full overflow-hidden ${className ?? ""}`}
      style={{ backgroundColor: fallbackColor, ...style }}
    />
  )
}
