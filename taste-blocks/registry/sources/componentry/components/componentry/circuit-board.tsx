"use client"

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "./lib/utils"

interface CircuitNode {
  id: string
  x: number
  y: number
  label?: string
  icon?: React.ReactNode
  status?: "active" | "inactive" | "processing" | "error"
  size?: "sm" | "md" | "lg"
}

interface CircuitConnection {
  from: string
  to: string
  animated?: boolean
  bidirectional?: boolean
  color?: string
  pulseColor?: string
}

interface CircuitBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  nodes: CircuitNode[]
  connections: CircuitConnection[]
  width?: number
  height?: number
  gridSize?: number
  showGrid?: boolean
  gridColor?: string
  traceColor?: string
  pulseColor?: string
  nodeColor?: string
  pulseSpeed?: number
  traceWidth?: number
  label?: string
  /** Force a specific theme variant. Defaults to auto-detect from system. */
  variant?: "light" | "dark" | "auto"
}

function CircuitBoard({
  nodes,
  connections,
  width = 600,
  height = 400,
  gridSize = 20,
  showGrid = true,
  gridColor,
  traceColor,
  pulseColor,
  nodeColor,
  pulseSpeed = 2,
  traceWidth = 2,
  variant = "auto",
  label = "Circuit network",
  className,
  ...props
}: CircuitBoardProps) {
  const reduceMotion = useReducedMotion()
  const definitionId = React.useId().replace(/:/g, "")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(true)
  const animateMotion = visible && !reduceMotion

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let intersecting = true
    const update = () => setVisible(intersecting && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry?.isIntersecting ?? false
      update()
    })
    observer.observe(container)
    document.addEventListener("visibilitychange", update)
    update()
    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", update)
    }
  }, [])
  // Theme-aware color defaults
  const [isDark, setIsDark] = React.useState(true)

  React.useEffect(() => {
    if (variant !== "auto") {
      setIsDark(variant === "dark")
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    // Explicit theme classes win; otherwise follow the system preference.
    const checkTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      const hasLightClass = document.documentElement.classList.contains("light") ||
        document.body.classList.contains("light")
      const isDarkMode = hasDarkClass || (!hasLightClass && mediaQuery.matches)
      setIsDark(isDarkMode)
    }

    checkTheme()

    // Listen for changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] })

    mediaQuery.addEventListener("change", checkTheme)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", checkTheme)
    }
  }, [variant])

  // Compute theme-aware colors
  const computedGridColor = gridColor || (isDark ? "rgba(163, 163, 163, 0.08)" : "rgba(64, 64, 64, 0.12)")
  const computedTraceColor = traceColor || (isDark ? "rgba(163, 163, 163, 0.25)" : "rgba(64, 64, 64, 0.35)")
  const computedPulseColor = pulseColor || (isDark ? "rgba(163, 163, 163, 0.6)" : "rgba(64, 64, 64, 0.7)")
  const computedNodeColor = nodeColor || (isDark ? "rgba(163, 163, 163, 0.5)" : "rgba(64, 64, 64, 0.6)")
  const nodeMap = React.useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]))
  }, [nodes])

  const getNodeSize = React.useCallback((size?: CircuitNode["size"]) => {
    switch (size) {
      case "sm":
        return 24
      case "lg":
        return 48
      default:
        return 36
    }
  }, [])

  const calculatePath = React.useCallback(
    (from: CircuitNode, to: CircuitNode): string => {
      const fromSize = getNodeSize(from.size) / 2 + 4
      const toSize = getNodeSize(to.size) / 2 + 4

      const dx = to.x - from.x
      const dy = to.y - from.y

      // Calculate start and end points offset from node centers
      let startX = from.x
      let startY = from.y
      let endX = to.x
      let endY = to.y

      // Create circuit-like paths with right angles
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal first, then vertical
        startX = from.x + (dx > 0 ? fromSize : -fromSize)
        endX = to.x + (dx > 0 ? -toSize : toSize)
        const midX = from.x + dx / 2
        return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`
      } else {
        // Vertical first, then horizontal
        startY = from.y + (dy > 0 ? fromSize : -fromSize)
        endY = to.y + (dy > 0 ? -toSize : toSize)
        const midY = from.y + dy / 2
        return `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`
      }
    },
    [getNodeSize]
  )

  const getStatusColor = (status?: CircuitNode["status"]) => {
    if (isDark) {
      switch (status) {
        case "active":
          return "rgba(163, 163, 163, 0.7)"
        case "processing":
          return "rgba(163, 163, 163, 0.5)"
        case "error":
          return "rgba(120, 113, 108, 0.6)"
        default:
          return computedNodeColor
      }
    } else {
      switch (status) {
        case "active":
          return "rgba(64, 64, 64, 0.8)"
        case "processing":
          return "rgba(64, 64, 64, 0.6)"
        case "error":
          return "rgba(180, 83, 83, 0.7)"
        default:
          return computedNodeColor
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ width, height }}
      role="img"
      aria-label={label}
      {...props}
    >
      <svg
        aria-hidden="true"
        width={width}
        height={height}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Glow filter for the pulse effect */}
          <filter id={`${definitionId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Grid pattern */}
          {showGrid && (
            <pattern
              id={`${definitionId}-grid`}
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={gridSize / 2} cy={gridSize / 2} r="0.5" fill={computedGridColor} />
            </pattern>
          )}
        </defs>

        {/* Grid background */}
        {showGrid && (
          <rect width={width} height={height} fill={`url(#${definitionId}-grid)`} />
        )}

        {/* Connection traces */}
        {connections.map((conn, i) => {
          const fromNode = nodeMap.get(conn.from)
          const toNode = nodeMap.get(conn.to)
          if (!fromNode || !toNode) return null

          const path = calculatePath(fromNode, toNode)
          const pathLength = 500 // Approximate path length for animation

          return (
            <g key={`connection-${i}`}>
              {/* Base trace */}
              <motion.path
                d={path}
                fill="none"
                stroke={conn.color || computedTraceColor}
                strokeWidth={traceWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: animateMotion ? 0 : 1 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: animateMotion ? 1 : 0, delay: animateMotion ? i * 0.2 : 0 }}
              />

              {/* Animated electricity pulse */}
              {conn.animated !== false && (
                <motion.path
                  d={path}
                  fill="none"
                  stroke={conn.pulseColor || computedPulseColor}
                  strokeWidth={traceWidth + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${definitionId}-glow)`}
                  strokeDasharray={`${pathLength * 0.1} ${pathLength * 0.9}`}
                  initial={{ strokeDashoffset: pathLength }}
                  animate={{ strokeDashoffset: animateMotion ? -pathLength : 0 }}
                  transition={{
                    duration: pulseSpeed,
                    repeat: animateMotion ? Infinity : 0,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                />
              )}

              {/* Bidirectional pulse */}
              {conn.bidirectional && (
                <motion.path
                  d={path}
                  fill="none"
                  stroke={conn.pulseColor || computedPulseColor}
                  strokeWidth={traceWidth + 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${definitionId}-glow)`}
                  strokeDasharray={`${pathLength * 0.1} ${pathLength * 0.9}`}
                  initial={{ strokeDashoffset: -pathLength }}
                  animate={{ strokeDashoffset: animateMotion ? pathLength : 0 }}
                  transition={{
                    duration: pulseSpeed,
                    repeat: animateMotion ? Infinity : 0,
                    ease: "linear",
                    delay: i * 0.3 + pulseSpeed / 2,
                  }}
                />
              )}


            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => {
        const size = getNodeSize(node.size)
        const statusColor = getStatusColor(node.status)

        return (
          <motion.div
            key={node.id}
            className="absolute flex items-center justify-center"
            style={{
              left: node.x - size / 2,
              top: node.y - size / 2,
              width: size,
              height: size,
            }}
            initial={{ scale: animateMotion ? 0 : 1, opacity: animateMotion ? 0 : 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={animateMotion ? { delay: i * 0.1 + 0.5, type: "spring" } : { duration: 0 }}
          >
            {/* Node background with pulse */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{ backgroundColor: statusColor }}
              animate={
                node.status === "processing"
                  ? { opacity: animateMotion ? [0.2, 0.5, 0.2] : 0.35 }
                  : { opacity: 0.2 }
              }
              transition={
                node.status === "processing"
                  ? { duration: animateMotion ? 1.5 : 0, repeat: animateMotion ? Infinity : 0 }
                  : {}
              }
            />

            {/* Node border */}
            <div
              className="absolute inset-0 rounded-lg border-2"
              style={{ borderColor: statusColor }}
            />

            {/* Inner glow for active nodes */}
            {node.status === "active" && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  boxShadow: `0 0 20px ${statusColor}40, inset 0 0 10px ${statusColor}20`,
                }}
                animate={{ opacity: animateMotion ? [0.5, 1, 0.5] : 0.75 }}
                transition={{ duration: animateMotion ? 2 : 0, repeat: animateMotion ? Infinity : 0 }}
              />
            )}

            {/* Node content */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {node.icon && (
                <div style={{ color: statusColor }}>{node.icon}</div>
              )}
            </div>

            {/* Label */}
            {node.label && (
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium"
                style={{ color: statusColor }}
              >
                {node.label}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export {
  CircuitBoard,
  type CircuitNode as CircuitNodeType,
  type CircuitConnection,
  type CircuitBoardProps,
}
