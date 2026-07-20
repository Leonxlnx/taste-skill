"use client"

import * as React from "react"
import {
  ReactPptxViewer,
  usePptxViewer,
  usePptxViewerThumbnails,
  type ParsedPresentation,
  type PptxSlideThumbnailItem,
  type PptxSlideThumbnailRenderWindow,
  type PptxViewerError,
  type PresentationSource,
} from "@extend-ai/react-pptx"

import "@extend-ai/react-pptx/styles.css"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Download01Icon,
  MinusSignCircleIcon,
  MoreHorizontalIcon,
  PlusSignCircleIcon,
  SidebarLeftIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useVirtualizer } from "@tanstack/react-virtual"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DocumentViewerThumbnailSidebar,
  useElementWidth,
  useInlineThumbnailSidebar,
} from "@/components/taste-blocks/extend-ui/document-viewer-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileThumbnail } from "@/components/taste-blocks/extend-ui/file-thumbnail"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PPTX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
const PPT_MIME_TYPE = "application/vnd.ms-powerpoint"
const DEFAULT_ZOOM = 100
const PPTX_LOADING_INDICATOR_DELAY_MS = 300
const PPTX_THUMBNAIL_WIDTH = 112
const PPTX_THUMBNAIL_LIST_PADDING = 12
const PPTX_THUMBNAIL_ROW_ESTIMATE = 112
const PPTX_THUMBNAIL_PREFETCH_ROWS = 0
const PPTX_THUMBNAIL_FOLLOW_DELAY_MS = 250
const PPTX_SCROLL_TOP_EPSILON_PX = 24
const PPTX_INSTANT_NAVIGATION_TIMEOUT_MS = 250
const PPTX_SMOOTH_NAVIGATION_TIMEOUT_MS = 1_000
const ZOOM_OPTIONS = [25, 50, 75, 100, 125, 150, 175, 200, 300, 400] as const
const PPTX_THUMBNAIL_FOCUS_RING_CLASS =
  "group-focus-visible/pptx-thumbnail-sidebar:ring-2 group-focus-visible/pptx-thumbnail-sidebar:ring-ring group-focus-visible/pptx-thumbnail-sidebar:ring-offset-1 group-focus-visible/pptx-thumbnail-sidebar:ring-offset-background"

type UploadedPresentation = {
  file: File
  identity: string
  sourceUrl: string | undefined
}

function areNumberArraysEqual(
  left: readonly number[],
  right: readonly number[]
) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function formatPresentationName(fileName: string | undefined, url: string) {
  if (fileName?.trim()) return fileName

  const pathname = url.split("?")[0] ?? ""
  const rawName = pathname.split("/").pop() ?? "presentation.pptx"

  try {
    return decodeURIComponent(rawName)
  } catch {
    return rawName
  }
}

function ensurePresentationExtension(fileName: string) {
  const lowerFileName = fileName.toLowerCase()

  return lowerFileName.endsWith(".pptx") || lowerFileName.endsWith(".ppt")
    ? fileName
    : `${fileName}.pptx`
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = fileName
  anchor.rel = "noopener"
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function downloadPresentation({
  file,
  fileName,
  url,
}: {
  file?: File
  fileName: string
  url?: string
}) {
  if (file) {
    downloadBlob(file, ensurePresentationExtension(fileName))
    return
  }

  if (!url) return

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download presentation (${response.status})`)
  }

  downloadBlob(await response.blob(), ensurePresentationExtension(fileName))
}

function getNextZoom(currentZoom: number, direction: 1 | -1) {
  if (direction > 0) {
    return ZOOM_OPTIONS.find((value) => value > currentZoom) ?? currentZoom
  }

  for (let index = ZOOM_OPTIONS.length - 1; index >= 0; index -= 1) {
    const value = ZOOM_OPTIONS[index]
    if (value < currentZoom) return value
  }

  return currentZoom
}

function useDelayedLoadingIndicator(isLoading: boolean, delayMs: number) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setVisible(false)
      return
    }

    const timeoutId = window.setTimeout(() => setVisible(true), delayMs)
    return () => window.clearTimeout(timeoutId)
  }, [delayMs, isLoading])

  return visible
}

function useDebouncedValue<TValue>(value: TValue, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [delayMs, value])

  return debouncedValue
}

function ViewerLoadingSurface({
  showSpinner = true,
}: {
  showSpinner?: boolean
}) {
  return (
    <div className="grid h-full min-h-96 w-full place-items-center bg-background">
      {showSpinner ? <Spinner className="size-4" /> : null}
    </div>
  )
}

function ToolbarTooltip({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function PptxFileActionsMenu({
  controlsDisabled,
  downloadDisabled,
  isPreparingDownload,
  onDownload,
  onUploadClick,
  showDownloadButton,
  showUploadButton,
}: {
  controlsDisabled: boolean
  downloadDisabled: boolean
  isPreparingDownload: boolean
  onDownload: () => void
  onUploadClick: () => void
  showDownloadButton: boolean
  showUploadButton: boolean
}) {
  if (!showDownloadButton && !showUploadButton) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open PowerPoint actions"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {showDownloadButton ? (
          <DropdownMenuItem disabled={downloadDisabled} onClick={onDownload}>
            {isPreparingDownload ? (
              <Spinner className="size-4" />
            ) : (
              <HugeiconsIcon icon={Download01Icon} className="size-4" />
            )}
            Download
          </DropdownMenuItem>
        ) : null}
        {showUploadButton ? (
          <DropdownMenuItem disabled={controlsDisabled} onClick={onUploadClick}>
            <HugeiconsIcon icon={Upload01Icon} className="size-4" />
            Upload
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PptxSlideNumberControl({
  activeSlideIndex,
  controlsDisabled,
  onSlideChange,
  slideCount,
}: {
  activeSlideIndex: number
  controlsDisabled: boolean
  onSlideChange: (slideIndex: number) => void
  slideCount: number
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const displaySlide = slideCount ? activeSlideIndex + 1 : 1
  const [isEditing, setIsEditing] = React.useState(false)
  const [draftSlide, setDraftSlide] = React.useState(() => String(displaySlide))

  React.useEffect(() => {
    if (!isEditing) setDraftSlide(String(displaySlide))
  }, [displaySlide, isEditing])

  React.useEffect(() => {
    if (!isEditing) return

    inputRef.current?.focus()
    inputRef.current?.select()
  }, [isEditing])

  const applySlideDraft = React.useCallback(
    (value: string) => {
      const parsedSlide = Number(value.trim())
      if (!Number.isInteger(parsedSlide)) return

      const nextSlide = Math.min(
        Math.max(parsedSlide, 1),
        Math.max(slideCount, 1)
      )
      onSlideChange(nextSlide - 1)
    },
    [onSlideChange, slideCount]
  )

  return (
    <div className="flex items-center text-sm whitespace-nowrap text-primary">
      <span>Slide</span>
      {isEditing ? (
        <Input
          ref={inputRef}
          aria-label="Slide number"
          inputMode="numeric"
          pattern="[0-9]*"
          size="sm"
          value={draftSlide}
          className="mx-1 w-14 min-w-14 rounded-md [&_[data-slot=input]]:text-center"
          onBlur={() => setIsEditing(false)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setDraftSlide(event.target.value)
            applySlideDraft(event.target.value)
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter" || event.key === "Escape") {
              event.currentTarget.blur()
            }
          }}
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="font-normal"
          aria-label={`Current slide ${displaySlide}. Edit slide number`}
          disabled={controlsDisabled || !slideCount}
          onClick={() => {
            setDraftSlide(String(displaySlide))
            setIsEditing(true)
          }}
        >
          {displaySlide}
        </Button>
      )}
      <span>of {slideCount || "-"}</span>
    </div>
  )
}

function PptxToolbar({
  activeSlideIndex,
  controlsDisabled,
  isPreparingDownload,
  onDownload,
  onSlideChange,
  onToggleSidebar,
  onUploadClick,
  setZoom,
  showDownloadButton,
  showUploadButton,
  slideCount,
  toolbarActions,
  zoom,
}: {
  activeSlideIndex: number
  controlsDisabled: boolean
  isPreparingDownload: boolean
  onDownload: () => void
  onSlideChange: (slideIndex: number) => void
  onToggleSidebar: () => void
  onUploadClick: () => void
  setZoom: React.Dispatch<React.SetStateAction<number>>
  showDownloadButton: boolean
  showUploadButton: boolean
  slideCount: number
  toolbarActions?: React.ReactNode
  zoom: number
}) {
  const canGoPrevious = !controlsDisabled && activeSlideIndex > 0
  const canGoNext =
    !controlsDisabled && slideCount > 0 && activeSlideIndex < slideCount - 1
  const canZoomOut = !controlsDisabled && zoom > ZOOM_OPTIONS[0]
  const canZoomIn =
    !controlsDisabled && zoom < ZOOM_OPTIONS[ZOOM_OPTIONS.length - 1]

  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b bg-background px-3 py-2">
      <TooltipProvider>
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          <ToolbarTooltip label="Toggle thumbnails">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Toggle thumbnails"
              disabled={controlsDisabled}
              onClick={onToggleSidebar}
            >
              <HugeiconsIcon icon={SidebarLeftIcon} className="size-4" />
            </Button>
          </ToolbarTooltip>
          <Separator orientation="vertical" className="mx-1 h-4 self-center" />
          <ToolbarTooltip label="Previous slide">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous slide"
              disabled={!canGoPrevious}
              onClick={() => onSlideChange(activeSlideIndex - 1)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </Button>
          </ToolbarTooltip>
          <PptxSlideNumberControl
            activeSlideIndex={activeSlideIndex}
            controlsDisabled={controlsDisabled}
            onSlideChange={onSlideChange}
            slideCount={slideCount}
          />
          <ToolbarTooltip label="Next slide">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next slide"
              disabled={!canGoNext}
              onClick={() => onSlideChange(activeSlideIndex + 1)}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Button>
          </ToolbarTooltip>
        </div>
        <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-1">
          <div className="flex flex-none items-center gap-1">
            <ToolbarTooltip label="Zoom out">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Zoom out"
                disabled={!canZoomOut}
                onClick={() =>
                  setZoom((currentZoom) => getNextZoom(currentZoom, -1))
                }
              >
                <HugeiconsIcon icon={MinusSignCircleIcon} className="size-4" />
              </Button>
            </ToolbarTooltip>
            <Select
              value={zoom.toString()}
              onValueChange={(value) => setZoom(Number(value))}
              disabled={controlsDisabled}
              modal={false}
            >
              <SelectTrigger
                size="sm"
                className="w-[84px] min-w-[84px]"
                aria-label="Zoom level"
              >
                <SelectValue>{Math.round(zoom)}%</SelectValue>
              </SelectTrigger>
              <SelectContent align="end" alignItemWithTrigger={false}>
                {ZOOM_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToolbarTooltip label="Zoom in">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Zoom in"
                disabled={!canZoomIn}
                onClick={() =>
                  setZoom((currentZoom) => getNextZoom(currentZoom, 1))
                }
              >
                <HugeiconsIcon icon={PlusSignCircleIcon} className="size-4" />
              </Button>
            </ToolbarTooltip>
          </div>
          {toolbarActions ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-1 h-4 self-center"
              />
              {toolbarActions}
            </>
          ) : null}
          {showDownloadButton || showUploadButton ? (
            <Separator
              orientation="vertical"
              className="mx-1 h-4 self-center"
            />
          ) : null}
          <PptxFileActionsMenu
            controlsDisabled={false}
            downloadDisabled={controlsDisabled || isPreparingDownload}
            isPreparingDownload={isPreparingDownload}
            onDownload={onDownload}
            onUploadClick={onUploadClick}
            showDownloadButton={showDownloadButton}
            showUploadButton={showUploadButton}
          />
        </div>
      </TooltipProvider>
    </div>
  )
}

function PptxSidebarThumbnail({
  aspectRatio,
  containerRef,
  displayFileName,
  isActive,
  slideNumber,
  status,
}: {
  aspectRatio: number
  containerRef: PptxSlideThumbnailItem["containerRef"]
  displayFileName: string
  isActive: boolean
  slideNumber: number
  status: PptxSlideThumbnailItem["status"]
}) {
  return (
    <FileThumbnail
      file={{
        name: `${displayFileName} slide ${slideNumber}`,
        type: PPTX_MIME_TYPE,
      }}
      previewAspectRatio={aspectRatio}
      previewClassName="rounded-sm bg-white"
      previewContent={
        <div
          ref={containerRef}
          className="size-full overflow-hidden bg-white [&_[data-rpv-slide-wrapper]]:!m-0"
        />
      }
      isLoading={status !== "ready" && status !== "error"}
      hasError={status === "error"}
      className={cn(
        "w-full rounded-sm border-0 shadow-xs ring-0 transition-shadow duration-150",
        isActive && "shadow-sm"
      )}
    />
  )
}

function PptxThumbnailSidebarList({
  activeSlideIndex,
  displayFileName,
  isLoading,
  onRenderWindowChange,
  onSelectSlide,
  sidebarOpen,
  slideCount,
  thumbnails,
}: {
  activeSlideIndex: number
  displayFileName: string
  isLoading: boolean
  onRenderWindowChange: (window: PptxSlideThumbnailRenderWindow) => void
  onSelectSlide: (slideIndex: number) => void
  sidebarOpen: boolean
  slideCount: number
  thumbnails: PptxSlideThumbnailItem[]
}) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const thumbnailListboxId = React.useId()
  const visibleThumbnails = React.useMemo(
    () => thumbnails.slice(0, slideCount || 0),
    [slideCount, thumbnails]
  )
  const activeDescendantId = visibleThumbnails.length
    ? `${thumbnailListboxId}-slide-${activeSlideIndex + 1}`
    : undefined
  const virtualizer = useVirtualizer({
    count: visibleThumbnails.length,
    estimateSize: () => PPTX_THUMBNAIL_ROW_ESTIMATE,
    getItemKey: (index) => visibleThumbnails[index]?.slide.id ?? index,
    getScrollElement: () => viewportRef.current,
    overscan: 0,
  })
  const virtualItems = virtualizer.getVirtualItems()
  const renderWindowSignature = virtualItems
    .map((virtualRow) => virtualRow.index)
    .join(",")
  const virtualSlideIndexes = React.useMemo(
    () =>
      renderWindowSignature
        ? renderWindowSignature.split(",").map((index) => Number(index))
        : [],
    [renderWindowSignature]
  )

  React.useEffect(() => {
    if (!sidebarOpen || isLoading || !visibleThumbnails.length) {
      onRenderWindowChange({
        prefetchSlideIndexes: [],
        visibleSlideIndexes: [],
      })
      return
    }

    const visibleSlideIndexes = virtualSlideIndexes
    const firstVirtualIndex = virtualSlideIndexes[0] ?? 0
    const lastVirtualIndex =
      virtualSlideIndexes[virtualSlideIndexes.length - 1] ?? firstVirtualIndex
    const firstPrefetchIndex = Math.max(
      0,
      firstVirtualIndex - PPTX_THUMBNAIL_PREFETCH_ROWS
    )
    const lastPrefetchIndex = Math.min(
      visibleThumbnails.length - 1,
      lastVirtualIndex + PPTX_THUMBNAIL_PREFETCH_ROWS
    )
    const visibleSlideIndexSet = new Set(visibleSlideIndexes)
    const prefetchSlideIndexes: number[] = []

    for (
      let index = firstPrefetchIndex;
      index <= lastPrefetchIndex;
      index += 1
    ) {
      if (!visibleSlideIndexSet.has(index)) {
        prefetchSlideIndexes.push(index)
      }
    }

    onRenderWindowChange({
      prefetchSlideIndexes,
      visibleSlideIndexes,
    })
  }, [
    isLoading,
    onRenderWindowChange,
    sidebarOpen,
    virtualSlideIndexes,
    visibleThumbnails.length,
  ])

  React.useEffect(() => {
    if (!sidebarOpen || !visibleThumbnails.length) return

    const frameId = window.requestAnimationFrame(() => {
      virtualizer.scrollToIndex(
        Math.min(activeSlideIndex, visibleThumbnails.length - 1),
        { align: "auto" }
      )
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [activeSlideIndex, sidebarOpen, virtualizer, visibleThumbnails.length])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (slideCount < 1) return

      let nextSlideIndex: number | null = null

      if (event.key === "ArrowDown") {
        nextSlideIndex = Math.min(slideCount - 1, activeSlideIndex + 1)
      } else if (event.key === "ArrowUp") {
        nextSlideIndex = Math.max(0, activeSlideIndex - 1)
      } else if (event.key === "Home") {
        nextSlideIndex = 0
      } else if (event.key === "End") {
        nextSlideIndex = slideCount - 1
      }

      if (nextSlideIndex === null) return

      event.preventDefault()
      onSelectSlide(nextSlideIndex)
    },
    [activeSlideIndex, onSelectSlide, slideCount]
  )

  return (
    <ScrollArea
      className="h-full"
      scrollFade
      viewportClassName="group/pptx-thumbnail-sidebar focus-visible:ring-0 focus-visible:ring-offset-0"
      viewportProps={{
        "aria-activedescendant": activeDescendantId,
        "aria-busy": isLoading || undefined,
        "aria-label": "PowerPoint slides",
        onKeyDown: handleKeyDown,
        onMouseDown: (event) => {
          event.currentTarget.focus({ preventScroll: true })
        },
        role: "listbox",
        tabIndex: 0,
      }}
      viewportRef={viewportRef}
    >
      {isLoading ? (
        <div className="p-4">
          <div className="mx-auto aspect-video w-28 overflow-hidden rounded-sm bg-background shadow-xs">
            <div className="h-full animate-pulse bg-muted" />
          </div>
          <div className="mx-auto mt-3 h-3 w-10 rounded-full bg-muted" />
        </div>
      ) : visibleThumbnails.length ? (
        <div
          className="relative"
          style={{
            height:
              virtualizer.getTotalSize() + PPTX_THUMBNAIL_LIST_PADDING * 2,
          }}
        >
          {virtualItems.map((virtualRow) => {
            const thumbnail = visibleThumbnails[virtualRow.index]
            if (!thumbnail) return null

            const isActive = thumbnail.slideIndex === activeSlideIndex

            return (
              <div
                key={virtualRow.key}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                className={cn(
                  "absolute top-0 right-2 left-2 pb-2 [contain:layout_paint_style]",
                  isActive && "z-10"
                )}
                style={{
                  transform: `translateY(${
                    virtualRow.start + PPTX_THUMBNAIL_LIST_PADDING
                  }px)`,
                }}
              >
                <div
                  id={`${thumbnailListboxId}-slide-${thumbnail.slideNumber}`}
                  role="option"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Slide ${thumbnail.slideNumber}`}
                  aria-posinset={thumbnail.slideNumber}
                  aria-selected={isActive}
                  aria-setsize={slideCount}
                  className={cn(
                    "flex h-auto w-full cursor-default flex-col items-center gap-2 rounded-md p-2 text-xs transition-colors outline-none select-none hover:bg-sidebar-accent",
                    isActive
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground",
                    isActive && PPTX_THUMBNAIL_FOCUS_RING_CLASS
                  )}
                  onClick={() => onSelectSlide(thumbnail.slideIndex)}
                >
                  <PptxSidebarThumbnail
                    aspectRatio={thumbnail.aspectRatio}
                    containerRef={thumbnail.containerRef}
                    displayFileName={displayFileName}
                    isActive={isActive}
                    slideNumber={thumbnail.slideNumber}
                    status={thumbnail.status}
                  />
                  {thumbnail.slideNumber}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </ScrollArea>
  )
}

function PptxThumbnailSidebarContent({
  activeSlideIndex,
  controller,
  displayFileName,
  isLoading,
  onSelectSlide,
  sidebarOpen,
  slideCount,
}: {
  activeSlideIndex: number
  controller: ReturnType<typeof usePptxViewer>["controller"]
  displayFileName: string
  isLoading: boolean
  onSelectSlide: (slideIndex: number) => void
  sidebarOpen: boolean
  slideCount: number
}) {
  const [renderWindow, setRenderWindow] =
    React.useState<PptxSlideThumbnailRenderWindow>({
      prefetchSlideIndexes: [],
      visibleSlideIndexes: [],
    })
  const thumbnailOptions = React.useMemo(
    () => ({
      renderWindow,
      resolution: {
        maxHeight: Math.round(PPTX_THUMBNAIL_WIDTH * 0.75),
        maxWidth: PPTX_THUMBNAIL_WIDTH,
      },
    }),
    [renderWindow]
  )
  const { thumbnails } = usePptxViewerThumbnails(controller, thumbnailOptions)
  const handleRenderWindowChange = React.useCallback(
    (nextWindow: PptxSlideThumbnailRenderWindow) => {
      setRenderWindow((currentWindow) => {
        const currentVisible = currentWindow.visibleSlideIndexes ?? []
        const nextVisible = nextWindow.visibleSlideIndexes ?? []
        const currentPrefetch = currentWindow.prefetchSlideIndexes ?? []
        const nextPrefetch = nextWindow.prefetchSlideIndexes ?? []

        if (
          areNumberArraysEqual(currentVisible, nextVisible) &&
          areNumberArraysEqual(currentPrefetch, nextPrefetch)
        ) {
          return currentWindow
        }

        return nextWindow
      })
    },
    []
  )

  return (
    <PptxThumbnailSidebarList
      activeSlideIndex={activeSlideIndex}
      displayFileName={displayFileName}
      isLoading={isLoading}
      onRenderWindowChange={handleRenderWindowChange}
      onSelectSlide={onSelectSlide}
      sidebarOpen={sidebarOpen}
      slideCount={slideCount}
      thumbnails={thumbnails}
    />
  )
}

export type PptxViewerPreviewProps = {
  className?: string
  defaultThumbnailSidebarOpen?: boolean
  defaultZoom?: number
  fileName?: string
  initialSlide?: number
  showDownload?: boolean
  showToolbar?: boolean
  showUpload?: boolean
  src?: string
  toolbarActions?: React.ReactNode
}

export function PptxViewerPreview({
  className,
  defaultThumbnailSidebarOpen = false,
  defaultZoom = DEFAULT_ZOOM,
  fileName,
  initialSlide = 1,
  showDownload = true,
  showToolbar = true,
  showUpload = true,
  src,
  toolbarActions,
}: PptxViewerPreviewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [viewerShellRef, viewerShellWidth] = useElementWidth<HTMLDivElement>()
  const requestedInitialSlideIndex = Math.max(0, Math.round(initialSlide) - 1)
  const [viewportElement, setViewportElement] =
    React.useState<HTMLDivElement | null>(null)
  const [uploadedPresentation, setUploadedPresentation] =
    React.useState<UploadedPresentation | null>(null)
  const [sidebarOpen, setSidebarOpen] = React.useState(
    defaultThumbnailSidebarOpen
  )
  const [thumbnailSidebarMounted, setThumbnailSidebarMounted] = React.useState(
    defaultThumbnailSidebarOpen
  )
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(
    requestedInitialSlideIndex
  )
  const [zoom, setZoom] = React.useState(() =>
    Math.min(400, Math.max(10, Math.round(defaultZoom)))
  )
  const [slideCount, setSlideCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(Boolean(src))
  const [loadError, setLoadError] = React.useState<string>()
  const [isPreparingDownload, setIsPreparingDownload] = React.useState(false)
  const viewer = usePptxViewer()
  const sidebarInline = useInlineThumbnailSidebar(viewerShellWidth)
  const activeUploadedPresentation =
    uploadedPresentation?.sourceUrl === src ? uploadedPresentation : null
  const source: PresentationSource | undefined =
    activeUploadedPresentation?.file ?? src
  const sourceIdentity = activeUploadedPresentation?.identity ?? src ?? ""
  const hasPresentation = Boolean(source)
  const displayFileName = React.useMemo(
    () =>
      activeUploadedPresentation?.file.name ??
      (src
        ? formatPresentationName(fileName, src)
        : (fileName ?? "presentation.pptx")),
    [activeUploadedPresentation?.file.name, fileName, src]
  )
  const thumbnailSidebarVisible = Boolean(sidebarOpen && hasPresentation)
  const sidebarActiveSlideIndex = useDebouncedValue(
    activeSlideIndex,
    PPTX_THUMBNAIL_FOLLOW_DELAY_MS
  )
  const controlsDisabled = !hasPresentation || isLoading || Boolean(loadError)
  const shouldShowLoadingSpinner = useDelayedLoadingIndicator(
    isLoading,
    PPTX_LOADING_INDICATOR_DELAY_MS
  )
  const virtualization = React.useMemo(
    () => ({
      enabled: true,
      overscanViewport: 0.75,
      scrollElement: viewportElement,
    }),
    [viewportElement]
  )
  const pendingSlideNavigationRef = React.useRef<{
    hasObservedIntermediateSlide: boolean
    targetIndex: number
    timeoutId: number
  } | null>(null)
  const cancelPendingSlideNavigation = React.useCallback(() => {
    const pendingNavigation = pendingSlideNavigationRef.current

    if (pendingNavigation) {
      window.clearTimeout(pendingNavigation.timeoutId)
      pendingSlideNavigationRef.current = null
    }
  }, [])

  React.useEffect(() => {
    if (thumbnailSidebarVisible) setThumbnailSidebarMounted(true)
  }, [thumbnailSidebarVisible])

  React.useEffect(() => {
    cancelPendingSlideNavigation()
    setSlideCount(0)
    setZoom(Math.min(400, Math.max(10, Math.round(defaultZoom))))
    setLoadError(undefined)
    setIsLoading(Boolean(sourceIdentity))
    viewportElement?.scrollTo({ top: 0, left: 0 })
  }, [
    cancelPendingSlideNavigation,
    defaultZoom,
    sourceIdentity,
    viewportElement,
  ])

  React.useEffect(
    () => cancelPendingSlideNavigation,
    [cancelPendingSlideNavigation]
  )

  React.useEffect(() => {
    setActiveSlideIndex(requestedInitialSlideIndex)
    if (viewer.controller?.isReady()) {
      void viewer.controller.goToSlide(requestedInitialSlideIndex, {
        behavior: "instant",
        block: "center",
      })
    }
  }, [requestedInitialSlideIndex, sourceIdentity, viewer.controller])

  const navigateToSlide = React.useCallback(
    (nextSlideIndex: number, behavior: ScrollBehavior) => {
      const normalizedSlideIndex = Math.min(
        Math.max(0, Math.round(nextSlideIndex)),
        Math.max(0, slideCount - 1)
      )
      const resolvedBehavior =
        behavior === "smooth" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : behavior

      cancelPendingSlideNavigation()
      const timeoutId = window.setTimeout(
        () => {
          const pendingNavigation = pendingSlideNavigationRef.current

          if (pendingNavigation?.targetIndex !== normalizedSlideIndex) return

          pendingSlideNavigationRef.current = null
          setActiveSlideIndex(normalizedSlideIndex)
        },
        resolvedBehavior === "smooth"
          ? PPTX_SMOOTH_NAVIGATION_TIMEOUT_MS
          : PPTX_INSTANT_NAVIGATION_TIMEOUT_MS
      )
      pendingSlideNavigationRef.current = {
        hasObservedIntermediateSlide: false,
        targetIndex: normalizedSlideIndex,
        timeoutId,
      }

      setActiveSlideIndex(normalizedSlideIndex)
      void viewer.controller?.goToSlide(normalizedSlideIndex, {
        behavior: resolvedBehavior,
        block: "center",
      })
    },
    [cancelPendingSlideNavigation, slideCount, viewer.controller]
  )
  const handleSlideChange = React.useCallback(
    (nextSlideIndex: number) => navigateToSlide(nextSlideIndex, "smooth"),
    [navigateToSlide]
  )
  const handleThumbnailSlideChange = React.useCallback(
    (nextSlideIndex: number) => navigateToSlide(nextSlideIndex, "instant"),
    [navigateToSlide]
  )
  const handleViewerSlideChange = React.useCallback(
    (nextSlideIndex: number) => {
      const pendingNavigation = pendingSlideNavigationRef.current

      if (pendingNavigation) {
        if (nextSlideIndex !== pendingNavigation.targetIndex) {
          pendingNavigation.hasObservedIntermediateSlide = true
          return
        }

        // The controller reports the destination immediately, before the smooth
        // scroll starts. Keep the destination authoritative until the scroll
        // observer has crossed an intermediate slide and reports it again.
        if (!pendingNavigation.hasObservedIntermediateSlide) return

        window.clearTimeout(pendingNavigation.timeoutId)
        pendingSlideNavigationRef.current = null
      }

      React.startTransition(() => {
        setActiveSlideIndex((currentSlideIndex) =>
          currentSlideIndex === nextSlideIndex
            ? currentSlideIndex
            : nextSlideIndex
        )
      })
    },
    []
  )
  const syncFirstSlideAtViewportTop = React.useCallback(
    (viewport: HTMLDivElement) => {
      if (viewport.scrollTop > PPTX_SCROLL_TOP_EPSILON_PX) return

      setActiveSlideIndex((currentSlideIndex) =>
        currentSlideIndex === 0 ? currentSlideIndex : 0
      )

      const controller = viewer.controller
      if (!isLoading && controller && controller.getSlideIndex() !== 0) {
        void controller.goToSlide(0, {
          behavior: "instant",
          block: "start",
        })
      }
    },
    [isLoading, viewer.controller]
  )
  const handleViewerUserScrollIntent = React.useCallback(
    (event: React.SyntheticEvent<HTMLDivElement>) => {
      const viewport = event.currentTarget

      // Stop an in-flight native smooth scroll before manual wheel, touch,
      // pointer, or keyboard input takes ownership of the viewport.
      viewport.scrollTo({
        behavior: "instant",
        left: viewport.scrollLeft,
        top: viewport.scrollTop,
      })
      cancelPendingSlideNavigation()
      syncFirstSlideAtViewportTop(viewport)
    },
    [cancelPendingSlideNavigation, syncFirstSlideAtViewportTop]
  )
  const handleViewerScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (pendingSlideNavigationRef.current) return
      syncFirstSlideAtViewportTop(event.currentTarget)
    },
    [syncFirstSlideAtViewportTop]
  )
  const handleViewerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "End" ||
        event.key === "Home" ||
        event.key === "PageDown" ||
        event.key === "PageUp" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        handleViewerUserScrollIntent(event)
      }
    },
    [handleViewerUserScrollIntent]
  )

  const handleLoad = React.useCallback((presentation: ParsedPresentation) => {
    const nextSlideCount = presentation.document.slides.length

    setSlideCount(nextSlideCount)
    setActiveSlideIndex((currentSlideIndex) =>
      Math.min(currentSlideIndex, Math.max(0, nextSlideCount - 1))
    )
    setLoadError(undefined)
  }, [])

  const handleReady = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleError = React.useCallback((error: PptxViewerError) => {
    setLoadError(error.message)
    setIsLoading(false)
  }, [])

  const handleDownload = React.useCallback(async () => {
    if (isPreparingDownload || !source) return

    setIsPreparingDownload(true)

    try {
      await downloadPresentation({
        file: activeUploadedPresentation?.file,
        fileName: displayFileName,
        url: activeUploadedPresentation ? undefined : src,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsPreparingDownload(false)
    }
  }, [
    activeUploadedPresentation,
    displayFileName,
    isPreparingDownload,
    source,
    src,
  ])

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    setUploadedPresentation({
      file,
      identity: `${file.name}-${file.size}-${file.lastModified}`,
      sourceUrl: src,
    })
  }

  return (
    <div
      className={cn(
        "flex h-[640px] min-h-0 flex-col overflow-hidden bg-background",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={`.ppt,.pptx,${PPT_MIME_TYPE},${PPTX_MIME_TYPE}`}
        className="hidden"
        onChange={handleUpload}
      />
      {showToolbar ? (
        <PptxToolbar
          activeSlideIndex={activeSlideIndex}
          controlsDisabled={controlsDisabled}
          isPreparingDownload={isPreparingDownload}
          onDownload={handleDownload}
          onSlideChange={handleSlideChange}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onUploadClick={() => fileInputRef.current?.click()}
          setZoom={setZoom}
          showDownloadButton={showDownload}
          showUploadButton={showUpload}
          slideCount={slideCount}
          toolbarActions={toolbarActions}
          zoom={zoom}
        />
      ) : null}
      <div
        ref={viewerShellRef}
        className="relative flex min-h-0 flex-1 overflow-hidden bg-background"
      >
        <DocumentViewerThumbnailSidebar
          inline={sidebarInline}
          open={thumbnailSidebarVisible}
        >
          {thumbnailSidebarMounted && hasPresentation ? (
            <PptxThumbnailSidebarContent
              activeSlideIndex={sidebarActiveSlideIndex}
              controller={viewer.controller}
              displayFileName={displayFileName}
              isLoading={isLoading}
              onSelectSlide={handleThumbnailSlideChange}
              sidebarOpen={thumbnailSidebarVisible}
              slideCount={slideCount}
            />
          ) : null}
        </DocumentViewerThumbnailSidebar>
        <ScrollArea
          className="min-h-0 flex-1 bg-background"
          viewportClassName="p-0"
          viewportProps={{
            "aria-label": "PowerPoint presentation",
            onKeyDown: handleViewerKeyDown,
            onPointerDown: handleViewerUserScrollIntent,
            onScroll: handleViewerScroll,
            onTouchStart: handleViewerUserScrollIntent,
            onWheel: handleViewerUserScrollIntent,
            tabIndex: 0,
          }}
          viewportRef={setViewportElement}
        >
          {!source ? (
            <div className="grid h-full min-h-96 place-items-center p-6 text-center">
              <div className="max-w-md rounded-lg border bg-background p-4 text-sm shadow-xs">
                <div className="font-medium">
                  Upload a PowerPoint presentation to preview
                </div>
                <div className="mt-1 text-muted-foreground">
                  Pass a PPTX URL with the <code>src</code> prop or upload a
                  PPTX or legacy PPT file.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <HugeiconsIcon icon={Upload01Icon} className="size-4" />
                  Upload PowerPoint
                </Button>
              </div>
            </div>
          ) : (
            <ReactPptxViewer
              key={sourceIdentity}
              ref={viewer.ref}
              source={source}
              mode="continuous"
              initialSlide={requestedInitialSlideIndex}
              zoom={zoom}
              fitMode="contain"
              height="100%"
              showToolbar={false}
              showThumbnails={false}
              virtualization={virtualization}
              className="min-h-full !border-0 !bg-background [&_.rpv-stage]:min-h-full [&_.rpv-stage]:!bg-background [&_.rpv-status]:!bg-background [&_.rpv-workspace]:min-h-full [&_[data-rpv-list-item]]:[contain:layout_paint_style]"
              viewportClassName="!min-h-full !px-4 !py-6"
              renderLoading={() => (
                <ViewerLoadingSurface showSpinner={shouldShowLoadingSpinner} />
              )}
              renderError={(error) => (
                <div className="grid h-full min-h-96 place-items-center p-6 text-center">
                  <div className="max-w-md rounded-lg border bg-background p-4 text-sm text-destructive shadow-xs">
                    <div className="font-medium">
                      Unable to display PowerPoint
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      {error.message}
                    </div>
                  </div>
                </div>
              )}
              emptyState={
                <div className="text-sm text-muted-foreground">
                  This presentation has no slides.
                </div>
              }
              onLoad={handleLoad}
              onReady={handleReady}
              onError={handleError}
              onSlideChange={handleViewerSlideChange}
            />
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
