"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const INLINE_THUMBNAIL_SIDEBAR_MIN_WIDTH = 768

export function useElementWidth<TElement extends HTMLElement>() {
  const ref = React.useRef<TElement | null>(null)
  const [width, setWidth] = React.useState(0)

  React.useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const updateWidth = () => {
      const nextWidth = element.getBoundingClientRect().width

      // Keep the last real measurement while the element is hidden or
      // detached (keep-alive preview pools, display:none ancestors): a
      // zero-width pass would re-lay-out the viewer for nothing, clearing
      // its rendered canvases, and force a blank-then-repaint flash when
      // the element comes back at its old size.
      if (nextWidth === 0) return
      setWidth(nextWidth)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

export function useInlineThumbnailSidebar(width: number) {
  return width >= INLINE_THUMBNAIL_SIDEBAR_MIN_WIDTH
}

export function DocumentViewerThumbnailSidebar({
  children,
  className,
  closedInlineClassName = "-ms-40",
  inline,
  open,
  widthClassName = "w-40",
}: {
  children: React.ReactNode
  className?: string
  closedInlineClassName?: string
  inline: boolean
  open: boolean
  widthClassName?: string
}) {
  const [transitionsReady, setTransitionsReady] = React.useState(false)
  const shouldAnimateSidebar = transitionsReady && open

  React.useEffect(() => {
    let secondFrameId = 0
    const firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        setTransitionsReady(true)
      })
    })

    return () => {
      window.cancelAnimationFrame(firstFrameId)
      window.cancelAnimationFrame(secondFrameId)
    }
  }, [])

  return (
    <aside
      data-document-thumbnail-sidebar=""
      data-sidebar-mode={inline ? "inline" : "overlay"}
      data-sidebar-open={open ? "true" : "false"}
      className={cn(
        "absolute inset-y-0 start-0 z-30 shrink-0 overflow-hidden border-e bg-sidebar shadow-lg",
        widthClassName,
        shouldAnimateSidebar
          ? "transition-[translate,margin-inline-start,border-color] duration-200 ease-out motion-reduce:transition-none"
          : "transition-none",
        inline && "relative z-auto translate-x-0 shadow-none",
        open
          ? "ms-0 translate-x-0"
          : inline
            ? cn("pointer-events-auto border-e-0", closedInlineClassName)
            : "pointer-events-none -translate-x-full border-e-0 rtl:translate-x-full",
        className
      )}
    >
      {children}
    </aside>
  )
}

export function DocumentViewerSidebarSkeleton({
  className,
  inline,
}: {
  className?: string
  inline: boolean
}) {
  if (!inline) return null

  return (
    <div className={cn("w-40 shrink-0 border-e bg-sidebar p-4", className)}>
      <div className="mx-auto h-28 w-20 overflow-hidden rounded-md bg-background shadow-xs">
        <div className="h-full animate-pulse bg-muted" />
      </div>
      <div className="mx-auto mt-3 h-3 w-10 rounded-full bg-muted" />
    </div>
  )
}
