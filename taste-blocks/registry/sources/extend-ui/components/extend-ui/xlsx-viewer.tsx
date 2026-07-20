"use client"

import * as React from "react"
import {
  useXlsxViewer,
  useXlsxViewerController,
  useXlsxViewerThumbnails,
  useXlsxViewerZoom,
  XlsxViewer,
  XlsxViewerProvider,
  type XlsxCellAddress,
  type XlsxScrollerRenderProps,
  type XlsxSheetData,
  type XlsxTableHeaderMenuRenderProps,
  type XlsxViewerController,
} from "@extend-ai/react-xlsx"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Download01Icon,
  MinusSignCircleIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  PlusSignCircleIcon,
  Search01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const XLSX_LOADING_INDICATOR_DELAY_MS = 300
const XLSX_DROPDOWN_Z_INDEX_CLASS = "z-40"
const XLSX_SEARCH_BATCH_ROW_COUNT = 500
const XLSX_SEARCH_DEBOUNCE_MS = 300
const XLSX_GRID_HEADER_HEIGHT = 24
const XLSX_GRID_ROW_HEADER_WIDTH = 40
const XLSX_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
const ZOOM_OPTIONS = [10, 25, 50, 75, 100, 125, 150, 175, 200, 400] as const

// Stable reference so the thumbnails memo isn't invalidated on every render
// (e.g. by selection changes), which would recompute every sheet thumbnail.
const XLSX_SHEET_TAB_THUMBNAIL_OPTIONS = {
  resolution: {
    maxHeight: 360,
    maxWidth: 560,
  },
} as const

type UploadedWorkbook = {
  buffer: ArrayBuffer
  fileName: string
  identity: string
}

type XlsxSearchResult = {
  cell: XlsxCellAddress
  displayValue: string
  formula?: string
  sheetIndex: number
  sheetName: string
  workbookSheetIndex: number
}

type XlsxBatchCell = {
  col?: unknown
  formula?: unknown
  value?: unknown
}

type XlsxBatchRow = {
  cells?: unknown
  index?: unknown
}

function formatWorkbookName(fileName: string | undefined, url: string) {
  if (fileName?.trim()) return fileName

  const pathname = url.split("?")[0] ?? ""
  const rawName = pathname.split("/").pop() ?? "workbook.xlsx"

  try {
    return decodeURIComponent(rawName)
  } catch {
    return rawName
  }
}

function ensureWorkbookExtension(fileName: string) {
  const lowerFileName = fileName.toLowerCase()
  return lowerFileName.endsWith(".xlsx") || lowerFileName.endsWith(".xls")
    ? fileName
    : `${fileName}.xlsx`
}

function downloadWorkbookBuffer(buffer: ArrayBuffer, fileName: string) {
  const resolvedFileName = ensureWorkbookExtension(fileName)
  const blob = new Blob([buffer], {
    type: resolvedFileName.toLowerCase().endsWith(".xls")
      ? "application/vnd.ms-excel"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = resolvedFileName
  anchor.rel = "noopener"
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function normalizeSearchText(value: unknown) {
  return typeof value === "string"
    ? value
    : value === null || value === undefined
      ? ""
      : String(value)
}

function cellValueToSearchText(value: unknown) {
  if (!value || typeof value !== "object") return normalizeSearchText(value)

  const record = value as {
    asBoolean?: () => boolean | null
    asError?: () => string | null
    asNumber?: () => number | null
    asText?: () => string | null
    is_boolean?: boolean
    is_empty?: boolean
    is_error?: boolean
    is_number?: boolean
    is_text?: boolean
  }

  if (record.is_empty) return ""
  if (record.is_error) return record.asError?.() ?? ""
  if (record.is_text) return record.asText?.() ?? ""
  if (record.is_number) return normalizeSearchText(record.asNumber?.())
  if (record.is_boolean) return record.asBoolean?.() ? "TRUE" : "FALSE"

  return normalizeSearchText(value)
}

function getCellSearchText(
  controller: XlsxViewerController,
  sheet: XlsxSheetData,
  row: number,
  col: number
) {
  const worksheet = controller.workbook?.getSheet(sheet.workbookSheetIndex)
  if (!worksheet) return { displayValue: "", formula: "" }

  const formula = worksheet.getFormulaAt(row, col) ?? ""
  const cachedFormulaValue = formula
    ? sheet.cachedFormulaValues[cellAddressToA1({ row, col })]
    : undefined
  const formatted = worksheet.getFormattedValueAt(row, col)

  if (
    formatted &&
    !(formula && cachedFormulaValue !== undefined && formatted.startsWith("#"))
  ) {
    return { displayValue: formatted, formula }
  }

  const calculated = worksheet.getCalculatedValueAt(row, col)
  const displayValue =
    formula && cachedFormulaValue !== undefined && calculated.is_error
      ? cachedFormulaValue
      : cellValueToSearchText(calculated)

  return { displayValue, formula }
}

function getBatchRows(rows: unknown): XlsxBatchRow[] {
  return Array.isArray(rows) ? (rows as XlsxBatchRow[]) : []
}

function getBatchCells(row: XlsxBatchRow): XlsxBatchCell[] {
  return Array.isArray(row.cells) ? (row.cells as XlsxBatchCell[]) : []
}

function cellMatchesQuery(
  displayValue: string,
  formula: string,
  query: string
) {
  return (
    displayValue.toLowerCase().includes(query) ||
    formula.toLowerCase().includes(query)
  )
}

function cellAddressToA1({ col, row }: XlsxCellAddress) {
  let columnNumber = col + 1
  let columnName = ""

  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26
    columnName = String.fromCharCode(65 + remainder) + columnName
    columnNumber = Math.floor((columnNumber - 1) / 26)
  }

  return `${columnName}${row + 1}`
}

async function findXlsxSearchResults(
  controller: XlsxViewerController,
  rawQuery: string
) {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return []

  const results: XlsxSearchResult[] = []

  for (const [sheetIndex, sheet] of controller.sheets.entries()) {
    const startRow = Math.max(0, sheet.minUsedRow)
    const endRow = Math.max(startRow, sheet.maxUsedRow)
    const visibleCols = sheet.visibleCols.filter(
      (col) => col >= sheet.minUsedCol && col <= sheet.maxUsedCol
    )
    const visibleRowSet = new Set(sheet.visibleRows)
    const visibleColSet = new Set(visibleCols)

    if (!visibleCols.length || sheet.maxUsedRow < sheet.minUsedRow) continue

    const worksheet = controller.workbook?.getSheet(sheet.workbookSheetIndex)
    const worksheetWithBatch = worksheet as
      | {
          getRowsBatch?: (
            startRow: number,
            rowCount: number,
            options?: Record<string, unknown>
          ) => unknown
        }
      | undefined

    for (
      let batchStartRow = startRow;
      batchStartRow <= endRow;
      batchStartRow += XLSX_SEARCH_BATCH_ROW_COUNT
    ) {
      const rowCount = Math.min(
        XLSX_SEARCH_BATCH_ROW_COUNT,
        endRow - batchStartRow + 1
      )
      const rows = controller.getRowsBatchAsync
        ? await controller.getRowsBatchAsync(
            sheet.workbookSheetIndex,
            batchStartRow,
            rowCount
          )
        : worksheetWithBatch?.getRowsBatch?.(batchStartRow, rowCount, {
            includeFormulas: true,
            useFormattedValues: true,
          })

      if (rows) {
        for (const rowEntry of getBatchRows(rows)) {
          const row = Number(rowEntry.index)
          if (!Number.isInteger(row) || !visibleRowSet.has(row)) {
            continue
          }

          for (const cellEntry of getBatchCells(rowEntry)) {
            const col = Number(cellEntry.col)
            if (!Number.isInteger(col) || !visibleColSet.has(col)) continue

            const displayValue = normalizeSearchText(cellEntry.value)
            const formula = normalizeSearchText(cellEntry.formula)

            if (!cellMatchesQuery(displayValue, formula, query)) continue

            results.push({
              cell: { row, col },
              displayValue,
              formula,
              sheetIndex,
              sheetName: sheet.name,
              workbookSheetIndex: sheet.workbookSheetIndex,
            })
          }
        }
        continue
      }

      if (!worksheet) continue

      const batchEndRow = batchStartRow + rowCount - 1
      for (const row of sheet.visibleRows) {
        if (row < batchStartRow || row > batchEndRow) continue

        for (const col of visibleCols) {
          const { displayValue, formula } = getCellSearchText(
            controller,
            sheet,
            row,
            col
          )

          if (!cellMatchesQuery(displayValue, formula, query)) continue

          results.push({
            cell: { row, col },
            displayValue,
            formula,
            sheetIndex,
            sheetName: sheet.name,
            workbookSheetIndex: sheet.workbookSheetIndex,
          })
        }
      }
    }
  }

  return results
}

function sumAxisBefore(values: number[], endIndex: number, zoomFactor: number) {
  let total = 0
  for (let index = 0; index < endIndex; index += 1) {
    total += (values[index] ?? 0) * zoomFactor
  }
  return total
}

function scrollXlsxCellIntoView({
  controller,
  result,
  viewport,
}: {
  controller: XlsxViewerController
  result: XlsxSearchResult
  viewport: HTMLDivElement | null
}) {
  if (!viewport) return

  const sheet = controller.sheets[result.sheetIndex]
  if (!sheet) return

  const rowIndex = sheet.visibleRows.indexOf(result.cell.row)
  const colIndex = sheet.visibleCols.indexOf(result.cell.col)
  if (rowIndex < 0 || colIndex < 0) return

  const zoomFactor = Math.max(0.1, controller.zoomScale / 100)
  const headerHeight = XLSX_GRID_HEADER_HEIGHT * zoomFactor
  const rowHeaderWidth = XLSX_GRID_ROW_HEADER_WIDTH * zoomFactor
  const rowStart =
    headerHeight + sumAxisBefore(sheet.rowHeights, rowIndex, zoomFactor)
  const colStart =
    rowHeaderWidth + sumAxisBefore(sheet.colWidths, colIndex, zoomFactor)
  const rowHeight =
    (sheet.rowHeights[rowIndex] ?? sheet.defaultRowHeightPx) * zoomFactor
  const colWidth =
    (sheet.colWidths[colIndex] ?? sheet.defaultColWidthPx) * zoomFactor
  const rowEnd = rowStart + rowHeight
  const colEnd = colStart + colWidth
  let nextTop = viewport.scrollTop
  let nextLeft = viewport.scrollLeft
  const visibleTop = viewport.scrollTop + headerHeight
  const visibleLeft = viewport.scrollLeft + rowHeaderWidth
  const visibleBottom = viewport.scrollTop + viewport.clientHeight
  const visibleRight = viewport.scrollLeft + viewport.clientWidth

  if (rowStart < visibleTop) {
    nextTop = rowStart - headerHeight
  } else if (rowEnd > visibleBottom) {
    nextTop = rowEnd - viewport.clientHeight
  }

  if (colStart < visibleLeft) {
    nextLeft = colStart - rowHeaderWidth
  } else if (colEnd > visibleRight) {
    nextLeft = colEnd - viewport.clientWidth
  }

  viewport.scrollTo({
    left: Math.max(0, nextLeft),
    top: Math.max(0, nextTop),
    behavior: "auto",
  })
}

function useDelayedLoadingIndicator(isLoading: boolean, delayMs: number) {
  const [showSpinner, setShowSpinner] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading) {
      setShowSpinner(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowSpinner(true)
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [delayMs, isLoading])

  return showSpinner
}

function ToolbarTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
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

function ViewerLoadingSurface({
  showSpinner = true,
}: {
  showSpinner?: boolean
}) {
  return (
    <div className="grid h-full min-h-52 w-full min-w-full place-items-center bg-transparent">
      {showSpinner ? <Spinner className="size-4" /> : null}
    </div>
  )
}

function WorkbookFileActionsMenu({
  isDark,
  onDownload,
  onIsDarkChange,
  onUploadClick,
  showDownloadButton,
  showNightRenderToggle = false,
  showUploadButton,
}: {
  isDark?: boolean
  onDownload?: () => void
  onIsDarkChange?: (checked: boolean) => void
  onUploadClick: () => void
  showDownloadButton: boolean
  showNightRenderToggle?: boolean
  showUploadButton: boolean
}) {
  const showThemeControl = showNightRenderToggle && Boolean(onIsDarkChange)
  const showFileActions = (showDownloadButton && onDownload) || showUploadButton
  if (!showThemeControl && !showFileActions) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open workbook actions"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-52", XLSX_DROPDOWN_Z_INDEX_CLASS)}
      >
        {showThemeControl ? (
          <>
            <DropdownMenuCheckboxItem
              checked={Boolean(isDark)}
              variant="switch"
              onCheckedChange={(checked) => onIsDarkChange?.(checked === true)}
            >
              <span className="flex min-w-0 items-center gap-2">
                <HugeiconsIcon icon={Moon02Icon} className="size-4" />
                Dark mode
              </span>
            </DropdownMenuCheckboxItem>
            {showFileActions ? <DropdownMenuSeparator /> : null}
          </>
        ) : null}
        {showDownloadButton && onDownload ? (
          <DropdownMenuItem onClick={onDownload}>
            <HugeiconsIcon icon={Download01Icon} className="size-4" />
            Download
          </DropdownMenuItem>
        ) : null}
        {showUploadButton ? (
          <DropdownMenuItem onClick={onUploadClick}>
            <HugeiconsIcon icon={Upload01Icon} className="size-4" />
            Upload
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function renderXlsxScroller({
  children,
  viewportProps,
}: XlsxScrollerRenderProps) {
  return (
    <ScrollArea
      className="h-full min-h-0 w-full min-w-0 flex-1"
      viewportProps={viewportProps}
    >
      {children}
    </ScrollArea>
  )
}

export function WorkbookTableHeaderMenu({
  direction,
  sortAscending,
  sortDescending,
  triggerIcon,
  triggerProps,
}: XlsxTableHeaderMenuRenderProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          {...triggerProps}
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn("size-6 rounded-sm", triggerProps.className)}
          aria-label="Column menu"
        >
          {triggerIcon ? (
            triggerIcon
          ) : (
            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("w-40", XLSX_DROPDOWN_Z_INDEX_CLASS)}
      >
        <DropdownMenuRadioGroup
          value={direction ?? ""}
          onValueChange={(value) => {
            if (value === "ascending") {
              sortAscending()
            } else {
              sortDescending()
            }
            setOpen(false)
          }}
        >
          <DropdownMenuRadioItem value="ascending">
            Sort ascending
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="descending">
            Sort descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function WorkbookSearchPopover({
  viewportRef,
  workbookIdentity,
}: {
  viewportRef: React.RefObject<HTMLDivElement | null>
  workbookIdentity: string
}) {
  const controller = useXlsxViewer()
  const [searchDraft, setSearchDraft] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<XlsxSearchResult[]>(
    []
  )
  const [activeResultIndex, setActiveResultIndex] = React.useState(0)
  const [isSearching, setIsSearching] = React.useState(false)
  const controllerRef = React.useRef(controller)
  const searchRequestIdRef = React.useRef(0)
  const appliedResultKeyRef = React.useRef("")
  const activeResult = searchResults[activeResultIndex] ?? null
  const activeResultKey = activeResult
    ? `${activeResult.workbookSheetIndex}:${activeResult.cell.row}:${activeResult.cell.col}`
    : ""
  const controlsDisabled =
    controller.isLoading ||
    Boolean(controller.error) ||
    !controller.sheets.length
  const hasActiveQuery = Boolean(searchQuery.trim())
  const resultLabel = isSearching
    ? "Searching"
    : !hasActiveQuery
      ? "No search"
      : searchResults.length
        ? `${activeResultIndex + 1} / ${searchResults.length}`
        : "No results"

  React.useEffect(() => {
    controllerRef.current = controller
  }, [controller])

  const runSearch = React.useCallback((rawQuery: string) => {
    const nextQuery = rawQuery.trim()
    const requestId = searchRequestIdRef.current + 1
    searchRequestIdRef.current = requestId
    appliedResultKeyRef.current = ""
    setSearchQuery(nextQuery)
    setActiveResultIndex(0)

    if (!nextQuery) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    void findXlsxSearchResults(controllerRef.current, nextQuery)
      .then((nextResults) => {
        if (searchRequestIdRef.current !== requestId) return
        setSearchResults(nextResults)
      })
      .catch(() => {
        if (searchRequestIdRef.current !== requestId) return
        setSearchResults([])
      })
      .finally(() => {
        if (searchRequestIdRef.current !== requestId) return
        setIsSearching(false)
      })
  }, [])

  React.useEffect(() => {
    const trimmedDraft = searchDraft.trim()

    if (!trimmedDraft) {
      runSearch("")
      return
    }

    setIsSearching(true)
    const timeoutId = window.setTimeout(() => {
      runSearch(searchDraft)
    }, XLSX_SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [runSearch, searchDraft])

  const clearSearch = React.useCallback(() => {
    searchRequestIdRef.current += 1
    setSearchDraft("")
    setSearchQuery("")
    setSearchResults([])
    setActiveResultIndex(0)
    setIsSearching(false)
    appliedResultKeyRef.current = ""
    controller.clearSelection()
  }, [controller])

  const goToRelativeResult = React.useCallback(
    (direction: 1 | -1) => {
      if (!searchResults.length) return

      setActiveResultIndex((currentIndex) => {
        return (
          (currentIndex + direction + searchResults.length) %
          searchResults.length
        )
      })
    },
    [searchResults.length]
  )

  React.useEffect(() => {
    searchRequestIdRef.current += 1
    setSearchDraft("")
    setSearchQuery("")
    setSearchResults([])
    setActiveResultIndex(0)
    setIsSearching(false)
    appliedResultKeyRef.current = ""
  }, [workbookIdentity])

  React.useEffect(() => {
    if (!activeResult) return

    if (controller.activeSheetIndex !== activeResult.sheetIndex) {
      appliedResultKeyRef.current = ""
      controller.setActiveSheetIndex(activeResult.sheetIndex)
      return
    }

    if (appliedResultKeyRef.current === activeResultKey) return
    appliedResultKeyRef.current = activeResultKey
    controller.selectCell(activeResult.cell)

    const frame = window.requestAnimationFrame(() => {
      scrollXlsxCellIntoView({
        controller,
        result: activeResult,
        viewport: viewportRef.current,
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [
    activeResult,
    activeResultKey,
    controller,
    controller.activeSheetIndex,
    viewportRef,
  ])

  return (
    <Popover>
      <ToolbarTooltip label="Search workbook">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Search workbook"
            disabled={controlsDisabled}
          >
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
          </Button>
        </PopoverTrigger>
      </ToolbarTooltip>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <Input
            placeholder="Search workbook"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return

              event.preventDefault()
              if (event.shiftKey && searchResults.length) {
                goToRelativeResult(-1)
              } else if (searchResults.length) {
                goToRelativeResult(1)
              } else if (searchDraft.trim()) {
                runSearch(searchDraft)
              }
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 text-xs text-muted-foreground">
              <div className="truncate">
                {searchResults.length ? (
                  <>
                    <span className="text-primary">
                      {activeResultIndex + 1}
                    </span>
                    {` / ${searchResults.length}`}
                  </>
                ) : (
                  resultLabel
                )}
              </div>
              {activeResult ? (
                <div className="mt-0.5 truncate">
                  {activeResult.sheetName}!{cellAddressToA1(activeResult.cell)}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Previous result"
                disabled={isSearching || searchResults.length === 0}
                onClick={() => goToRelativeResult(-1)}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Next result"
                disabled={isSearching || searchResults.length === 0}
                onClick={() => goToRelativeResult(1)}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSearch}
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function WorkbookToolbar({
  isDark,
  onDownload,
  onIsDarkChange,
  onUploadClick,
  showDownloadButton = true,
  showNightRenderToggle,
  showUploadButton = true,
  toolbarActions,
  viewportRef,
  workbookIdentity,
}: {
  isDark: boolean
  onDownload?: () => void
  onIsDarkChange: (checked: boolean) => void
  onUploadClick: () => void
  showDownloadButton?: boolean
  showNightRenderToggle: boolean
  showUploadButton?: boolean
  toolbarActions?: React.ReactNode
  viewportRef: React.RefObject<HTMLDivElement | null>
  workbookIdentity: string
}) {
  const { canZoomIn, canZoomOut, setZoomScale, zoomIn, zoomOut, zoomScale } =
    useXlsxViewerZoom()
  const currentZoom = Math.round(zoomScale)

  React.useEffect(() => {
    setZoomScale(100)
  }, [setZoomScale, workbookIdentity])

  return (
    <div className="flex min-h-12 flex-wrap items-center justify-end gap-2 border-b bg-background px-3 py-2">
      <TooltipProvider>
        <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-1">
          <div className="flex flex-none items-center gap-1">
            <ToolbarTooltip label="Zoom out">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={!canZoomOut}
                aria-label="Zoom out"
                onClick={zoomOut}
              >
                <HugeiconsIcon icon={MinusSignCircleIcon} className="size-4" />
              </Button>
            </ToolbarTooltip>
            <Select
              value={currentZoom.toString()}
              onValueChange={(value) => setZoomScale(Number(value))}
              modal={false}
            >
              <SelectTrigger
                size="sm"
                className="w-[84px] min-w-[84px]"
                aria-label="Zoom level"
              >
                <SelectValue>{currentZoom}%</SelectValue>
              </SelectTrigger>
              <SelectContent
                align="end"
                alignItemWithTrigger={false}
                className={XLSX_DROPDOWN_Z_INDEX_CLASS}
              >
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
                disabled={!canZoomIn}
                aria-label="Zoom in"
                onClick={zoomIn}
              >
                <HugeiconsIcon icon={PlusSignCircleIcon} className="size-4" />
              </Button>
            </ToolbarTooltip>
          </div>
          <Separator orientation="vertical" className="mx-1 h-4 self-center" />
          <WorkbookSearchPopover
            viewportRef={viewportRef}
            workbookIdentity={workbookIdentity}
          />
          {toolbarActions ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-1 h-4 self-center"
              />
              {toolbarActions}
            </>
          ) : null}
          {(showDownloadButton && onDownload) ||
          showUploadButton ||
          showNightRenderToggle ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-1 h-4 self-center"
              />
              <WorkbookFileActionsMenu
                isDark={isDark}
                onDownload={onDownload}
                onIsDarkChange={onIsDarkChange}
                onUploadClick={onUploadClick}
                showDownloadButton={showDownloadButton}
                showNightRenderToggle={showNightRenderToggle}
                showUploadButton={showUploadButton}
              />
            </>
          ) : null}
        </div>
      </TooltipProvider>
    </div>
  )
}

function WorkbookStandaloneToolbar({
  onUploadClick,
  showUploadButton = true,
  toolbarActions,
}: {
  onUploadClick: () => void
  showUploadButton?: boolean
  toolbarActions?: React.ReactNode
}) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-end gap-2 border-b bg-background px-3 py-2">
      <TooltipProvider>
        <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-1">
          {toolbarActions ? <>{toolbarActions}</> : null}
          {showUploadButton ? (
            <>
              {toolbarActions ? (
                <Separator
                  orientation="vertical"
                  className="mx-1 h-4 self-center"
                />
              ) : null}
              <WorkbookFileActionsMenu
                onUploadClick={onUploadClick}
                showDownloadButton={false}
                showUploadButton={showUploadButton}
              />
            </>
          ) : null}
        </div>
      </TooltipProvider>
    </div>
  )
}

type WorkbookSheetTab = {
  name: string
  workbookSheetIndex: number
}

type WorkbookSheetTabsInnerProps = {
  activeSheetIndex: number
  onActiveSheetIndexChange: (index: number) => void
  sheets: WorkbookSheetTab[]
  workbookIdentity: string
}

export function WorkbookSheetTabs({
  workbookIdentity,
}: {
  workbookIdentity: string
}) {
  const { activeSheetIndex, setActiveSheetIndex, sheets } = useXlsxViewer()

  const handleActiveSheetIndexChange = React.useCallback(
    (index: number) => setActiveSheetIndex(index),
    [setActiveSheetIndex]
  )

  return (
    <WorkbookSheetTabsInner
      activeSheetIndex={activeSheetIndex}
      onActiveSheetIndexChange={handleActiveSheetIndexChange}
      sheets={sheets}
      workbookIdentity={workbookIdentity}
    />
  )
}

const WorkbookSheetTabsInner = React.memo(function WorkbookSheetTabsInner({
  activeSheetIndex,
  onActiveSheetIndexChange,
  sheets,
  workbookIdentity,
}: WorkbookSheetTabsInnerProps) {
  const [visiblePreviewIndex, setVisiblePreviewIndex] = React.useState<
    number | null
  >(null)
  const [previewPosition, setPreviewPosition] = React.useState({
    left: 0,
    top: 0,
  })
  const { thumbnails } = useXlsxViewerThumbnails(
    XLSX_SHEET_TAB_THUMBNAIL_OPTIONS
  )
  const [thumbnailUrls, setThumbnailUrls] = React.useState<
    Record<number, string>
  >({})
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const itemRefs = React.useRef<Record<number, HTMLButtonElement | null>>({})
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const previewWidth = 220
  const previewHeight = (previewWidth * 7) / 11
  const previewGap = 12
  const previewOpenDelayMs = 500

  const clearOpenTimeout = React.useCallback(() => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }
  }, [])

  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const getPreviewPosition = React.useCallback(
    (sheetIndex: number) => {
      const item = itemRefs.current[sheetIndex]
      if (!item || typeof window === "undefined") {
        return { left: 0, top: 0 }
      }

      const itemRect = item.getBoundingClientRect()
      const centeredLeft = itemRect.left + itemRect.width / 2 - previewWidth / 2
      const minLeft = 8
      const maxLeft = Math.max(minLeft, window.innerWidth - previewWidth - 8)
      const left = Math.max(minLeft, Math.min(centeredLeft, maxLeft))
      const top = Math.max(8, itemRect.top - previewHeight - previewGap)

      return { left, top }
    },
    [previewHeight]
  )

  const updatePreviewPosition = React.useCallback(
    (sheetIndex: number) => {
      setPreviewPosition(getPreviewPosition(sheetIndex))
    },
    [getPreviewPosition]
  )

  const handleItemEnter = React.useCallback(
    (sheetIndex: number) => {
      clearCloseTimeout()
      const nextPreviewPosition = getPreviewPosition(sheetIndex)

      if (visiblePreviewIndex !== null) {
        clearOpenTimeout()
        setPreviewPosition(nextPreviewPosition)
        setVisiblePreviewIndex(sheetIndex)
        return
      }

      clearOpenTimeout()
      openTimeoutRef.current = setTimeout(() => {
        setPreviewPosition(nextPreviewPosition)
        setVisiblePreviewIndex(sheetIndex)
      }, previewOpenDelayMs)
    },
    [
      clearCloseTimeout,
      clearOpenTimeout,
      getPreviewPosition,
      visiblePreviewIndex,
    ]
  )

  const handleContainerLeave = React.useCallback(() => {
    clearOpenTimeout()
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setVisiblePreviewIndex(null)
    }, 80)
  }, [clearCloseTimeout, clearOpenTimeout])

  React.useEffect(() => {
    return () => {
      clearOpenTimeout()
      clearCloseTimeout()
    }
  }, [clearCloseTimeout, clearOpenTimeout])

  React.useEffect(() => {
    clearOpenTimeout()
    clearCloseTimeout()
    setVisiblePreviewIndex(null)
    setPreviewPosition({ left: 0, top: 0 })
    setThumbnailUrls({})
  }, [clearCloseTimeout, clearOpenTimeout, workbookIdentity])

  React.useEffect(() => {
    thumbnails.forEach((thumbnail) => {
      setThumbnailUrls((current) => {
        if (current[thumbnail.sheetIndex]) return current

        const canvas = document.createElement("canvas")
        canvas.width = thumbnail.width
        canvas.height = thumbnail.height

        if (!thumbnail.paint(canvas)) return current

        return {
          ...current,
          [thumbnail.sheetIndex]: canvas.toDataURL("image/png"),
        }
      })
    })
  }, [thumbnails])

  React.useEffect(() => {
    if (visiblePreviewIndex === null) return

    const handleReposition = () => updatePreviewPosition(visiblePreviewIndex)
    handleReposition()

    const scrollElement = scrollRef.current
    window.addEventListener("resize", handleReposition)
    scrollElement?.addEventListener("scroll", handleReposition, {
      passive: true,
    })

    return () => {
      window.removeEventListener("resize", handleReposition)
      scrollElement?.removeEventListener("scroll", handleReposition)
    }
  }, [updatePreviewPosition, visiblePreviewIndex])

  // The preview card portals to document.body, so it outlives the tab
  // strip's own visibility: when the viewer is hidden or reparented under
  // the cursor (keep-alive preview pools, a closing dialog) no mouseleave
  // fires and the card would hang on screen. While the preview is open,
  // poll the strip's effective visibility and dismiss as soon as it stops
  // being shown.
  React.useEffect(() => {
    if (visiblePreviewIndex === null) return

    const dismissWhenHidden = () => {
      const element = scrollRef.current
      const isVisible = Boolean(
        element?.isConnected &&
          (element.checkVisibility?.({ checkVisibilityCSS: true }) ?? true)
      )

      if (isVisible) return
      clearOpenTimeout()
      clearCloseTimeout()
      setVisiblePreviewIndex(null)
    }
    const interval = setInterval(dismissWhenHidden, 200)

    return () => clearInterval(interval)
  }, [clearCloseTimeout, clearOpenTimeout, visiblePreviewIndex])

  if (sheets.length <= 1) return null

  const previewSheet =
    visiblePreviewIndex === null ? null : sheets[visiblePreviewIndex]
  const previewUrl =
    visiblePreviewIndex === null
      ? null
      : (thumbnailUrls[visiblePreviewIndex] ?? null)

  return (
    <div
      className="border-t bg-muted/40 px-3 py-2"
      onMouseLeave={handleContainerLeave}
    >
      <Tabs
        value={String(activeSheetIndex)}
        onValueChange={(value) => onActiveSheetIndexChange(Number(value))}
        className="gap-0"
      >
        <ScrollArea
          orientation="horizontal"
          scrollbarGutter
          className="h-10 w-full has-[[data-slot=scroll-area-viewport][data-has-overflow-x]]:h-[50px]"
          viewportClassName="overflow-y-hidden"
          viewportRef={scrollRef}
        >
          <div className="flex h-full items-center">
            <TabsList className="shrink-0">
              {sheets.map((sheet, index) => (
                <TabsTrigger
                  key={`${sheet.workbookSheetIndex}-${sheet.name}`}
                  ref={(node) => {
                    itemRefs.current[index] = node
                  }}
                  value={String(index)}
                  className="max-w-48 flex-none"
                  onMouseEnter={() => handleItemEnter(index)}
                >
                  <span className="truncate">{sheet.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </ScrollArea>
      </Tabs>
      {typeof document !== "undefined" &&
      previewSheet &&
      visiblePreviewIndex !== null &&
      previewUrl
        ? createPortal(
            <div
              className="pointer-events-none fixed z-40 translate-y-0 overflow-hidden rounded-lg border bg-background/95 opacity-100 shadow-xl backdrop-blur-md transition-[opacity,transform] duration-100"
              style={{
                left: previewPosition.left,
                top: previewPosition.top,
                width: previewWidth,
              }}
            >
              <div className="relative aspect-[11/7] w-full overflow-hidden bg-muted/60">
                {/* eslint-disable-next-line @next/next/no-img-element -- Workbook sheet previews are generated runtime image URLs. */}
                <img
                  key={`${workbookIdentity}-${visiblePreviewIndex}-${previewUrl}`}
                  src={previewUrl}
                  alt={`${previewSheet.name} preview`}
                  className="absolute inset-0 h-full w-full object-cover object-left-top"
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
})

export function XlsxWorkbookSurface({
  className,
  isDark,
  onDownload,
  onIsDarkChange,
  onUploadClick,
  renderTableHeaderMenu,
  showDownloadButton = true,
  showNightRenderToggle,
  showToolbar = true,
  showUploadButton = true,
  toolbarActions,
  workbookIdentity,
}: {
  className?: string
  isDark: boolean
  onDownload?: () => void
  onIsDarkChange: (checked: boolean) => void
  onUploadClick: () => void
  renderTableHeaderMenu: (
    props: XlsxTableHeaderMenuRenderProps
  ) => React.ReactNode
  showDownloadButton?: boolean
  showNightRenderToggle: boolean
  showToolbar?: boolean
  showUploadButton?: boolean
  toolbarActions?: React.ReactNode
  workbookIdentity: string
}) {
  const { error } = useXlsxViewer()
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const renderSearchableScroller = React.useCallback(
    ({ children, viewportProps }: XlsxScrollerRenderProps) => (
      <ScrollArea
        className="h-full min-h-0 w-full min-w-0 flex-1"
        viewportProps={viewportProps}
        viewportRef={viewportRef}
      >
        {children}
      </ScrollArea>
    ),
    []
  )

  return (
    <div
      className={cn(
        "flex h-[640px] min-h-0 flex-col overflow-hidden bg-background",
        className
      )}
    >
      {showToolbar ? (
        <WorkbookToolbar
          isDark={isDark}
          onDownload={onDownload}
          onIsDarkChange={onIsDarkChange}
          onUploadClick={onUploadClick}
          showDownloadButton={showDownloadButton}
          showNightRenderToggle={showNightRenderToggle}
          showUploadButton={showUploadButton}
          toolbarActions={toolbarActions}
          viewportRef={viewportRef}
          workbookIdentity={workbookIdentity}
        />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 bg-muted/20">
          <XlsxViewer
            experimentalCanvas
            allowResizeInReadOnly
            className="h-full min-h-0 min-w-0"
            height="100%"
            isDark={isDark}
            readOnly
            rounded={false}
            showDefaultToolbar={false}
            showImages
            fileTooLargeState={
              <div className="grid h-full w-full min-w-full place-items-center p-6">
                <div className="max-w-sm rounded-lg border bg-background p-4 text-sm">
                  <p className="font-medium">File too large</p>
                  <p className="mt-1 text-muted-foreground">
                    This workbook exceeds the display limit. Download it to view
                    the full file.
                  </p>
                </div>
              </div>
            }
            loadingState={<ViewerLoadingSurface />}
            renderScroller={renderSearchableScroller}
            errorState={
              <div className="grid h-full w-full min-w-full place-items-center p-6 text-sm text-destructive">
                {error?.message ?? "Unable to display workbook."}
              </div>
            }
            renderTableHeaderMenu={renderTableHeaderMenu}
          />
        </div>
        <WorkbookSheetTabs workbookIdentity={workbookIdentity} />
      </div>
    </div>
  )
}

export function XlsxViewerPreview({
  className,
  fileName,
  isDark,
  onIsDarkChange,
  showDownload = true,
  showToolbar = true,
  showUpload = true,
  src,
  toolbarActions,
}: {
  className?: string
  fileName?: string
  isDark: boolean
  onIsDarkChange: (isDark: boolean) => void
  showDownload?: boolean
  showToolbar?: boolean
  showUpload?: boolean
  src?: string
  toolbarActions?: React.ReactNode
}) {
  return (
    <XlsxViewerContent
      className={className}
      effectiveIsDark={isDark}
      fileName={fileName}
      setNightRenderEnabled={onIsDarkChange}
      shouldRenderNightMode
      showDownload={showDownload}
      showToolbar={showToolbar}
      showUpload={showUpload}
      toolbarActions={toolbarActions}
      url={src}
    />
  )
}

function XlsxViewerContent({
  className,
  effectiveIsDark,
  fileName,
  setNightRenderEnabled,
  shouldRenderNightMode,
  showDownload,
  showToolbar = true,
  showUpload,
  toolbarActions,
  url,
}: {
  className?: string
  effectiveIsDark: boolean
  fileName?: string
  setNightRenderEnabled: (checked: boolean) => void
  shouldRenderNightMode: boolean
  showDownload: boolean
  showToolbar?: boolean
  showUpload: boolean
  toolbarActions?: React.ReactNode
  url?: string
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploadedWorkbook, setUploadedWorkbook] =
    React.useState<UploadedWorkbook | null>(null)
  const sourceFileName = React.useMemo(
    () =>
      url ? formatWorkbookName(fileName, url) : (fileName ?? "workbook.xlsx"),
    [fileName, url]
  )
  const displayFileName = React.useMemo(
    () => uploadedWorkbook?.fileName ?? sourceFileName,
    [sourceFileName, uploadedWorkbook?.fileName]
  )
  const workbookIdentity = React.useMemo(
    () => uploadedWorkbook?.identity ?? `${url ?? "empty"}::${displayFileName}`,
    [displayFileName, uploadedWorkbook?.identity, url]
  )
  const [workbookBuffer, setWorkbookBuffer] =
    React.useState<ArrayBuffer | null>(null)
  const [loadError, setLoadError] = React.useState<string>()
  const shouldShowLoadingSpinner = useDelayedLoadingIndicator(
    !workbookBuffer && !loadError && !uploadedWorkbook,
    XLSX_LOADING_INDICATOR_DELAY_MS
  )

  React.useEffect(() => {
    let isCurrent = true
    if (url) {
      setUploadedWorkbook(null)
    }

    async function loadWorkbook(): Promise<void> {
      if (!url) {
        setWorkbookBuffer(null)
        setLoadError(undefined)
        return
      }

      setWorkbookBuffer(null)
      setLoadError(undefined)

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch XLSX (${response.status})`)
        }

        const nextWorkbookBuffer = await response.arrayBuffer()
        if (!isCurrent) return

        setWorkbookBuffer(nextWorkbookBuffer)
      } catch (error) {
        if (!isCurrent) return

        setLoadError(
          error instanceof Error ? error.message : "Unknown XLSX load error"
        )
      }
    }

    void loadWorkbook()

    return () => {
      isCurrent = false
    }
  }, [url])

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    const buffer = await file.arrayBuffer()
    setLoadError(undefined)
    setUploadedWorkbook({
      buffer,
      fileName: file.name,
      identity: `${file.name}-${file.size}-${file.lastModified}`,
    })
  }

  const activeBuffer = uploadedWorkbook?.buffer ?? workbookBuffer
  const activeFileName = uploadedWorkbook?.fileName ?? displayFileName
  const activeIdentity = workbookIdentity

  if (!url && !uploadedWorkbook) {
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
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={handleUpload}
        />
        <WorkbookStandaloneToolbar
          onUploadClick={() => fileInputRef.current?.click()}
          showUploadButton={showUpload}
          toolbarActions={toolbarActions}
        />
        <div className="grid min-h-0 flex-1 place-items-center bg-muted/30 p-4">
          <div className="max-w-md rounded-lg border bg-background p-4 text-center text-sm shadow-xs">
            <p className="font-medium">Upload a workbook to preview</p>
            <p className="mt-1 text-muted-foreground">
              Pass an XLSX URL with the <code>src</code> prop or upload a file.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-4" />
              Upload XLSX
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loadError && !activeBuffer) {
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
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={handleUpload}
        />
        <WorkbookStandaloneToolbar
          onUploadClick={() => fileInputRef.current?.click()}
          showUploadButton={showUpload}
          toolbarActions={toolbarActions}
        />
        <div className="grid min-h-0 flex-1 place-items-center bg-muted/30 p-4">
          <div className="max-w-md rounded-lg border bg-background p-4 text-sm">
            <p className="font-medium">Unable to display workbook</p>
            <p className="mt-1 text-muted-foreground">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-4" />
              Upload XLSX
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!activeBuffer) {
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
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={handleUpload}
        />
        <WorkbookStandaloneToolbar
          onUploadClick={() => fileInputRef.current?.click()}
          showUploadButton={showUpload}
          toolbarActions={toolbarActions}
        />
        <ViewerLoadingSurface showSpinner={shouldShowLoadingSpinner} />
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="hidden"
        onChange={handleUpload}
      />
      <XlsxWorkbookLoadedViewer
        className={className}
        fileName={activeFileName}
        isDark={effectiveIsDark}
        onDownload={() => downloadWorkbookBuffer(activeBuffer, activeFileName)}
        onIsDarkChange={setNightRenderEnabled}
        onUploadClick={() => fileInputRef.current?.click()}
        renderTableHeaderMenu={(props) => (
          <WorkbookTableHeaderMenu {...props} />
        )}
        showDownloadButton={showDownload}
        showNightRenderToggle={shouldRenderNightMode}
        showToolbar={showToolbar}
        showUploadButton={showUpload}
        toolbarActions={toolbarActions}
        workbookBuffer={activeBuffer}
        workbookIdentity={activeIdentity}
      />
    </div>
  )
}

function XlsxWorkbookLoadedViewer({
  className,
  fileName,
  isDark,
  onDownload,
  onIsDarkChange,
  onUploadClick,
  renderTableHeaderMenu,
  showDownloadButton,
  showNightRenderToggle,
  showToolbar = true,
  showUploadButton,
  toolbarActions,
  workbookBuffer,
  workbookIdentity,
}: {
  className?: string
  fileName: string
  isDark: boolean
  onDownload: () => void
  onIsDarkChange: (checked: boolean) => void
  onUploadClick: () => void
  renderTableHeaderMenu: (
    props: XlsxTableHeaderMenuRenderProps
  ) => React.ReactNode
  showDownloadButton: boolean
  showNightRenderToggle: boolean
  showToolbar?: boolean
  showUploadButton: boolean
  toolbarActions?: React.ReactNode
  workbookBuffer: ArrayBuffer
  workbookIdentity: string
}) {
  const controller = useXlsxViewerController(
    React.useMemo(
      () => ({
        allowResizeInReadOnly: true,
        file: workbookBuffer,
        fileName,
        maxFileSizeBytes: XLSX_MAX_FILE_SIZE_BYTES,
        readOnly: true,
        useWorker: true,
      }),
      [fileName, workbookBuffer]
    )
  )

  return (
    <XlsxViewerProvider controller={controller} isDark={isDark}>
      <XlsxWorkbookSurface
        className={className}
        isDark={isDark}
        onDownload={onDownload}
        onIsDarkChange={onIsDarkChange}
        onUploadClick={onUploadClick}
        renderTableHeaderMenu={renderTableHeaderMenu}
        showDownloadButton={showDownloadButton}
        showNightRenderToggle={showNightRenderToggle}
        showToolbar={showToolbar}
        showUploadButton={showUploadButton}
        toolbarActions={toolbarActions}
        workbookIdentity={workbookIdentity}
      />
    </XlsxViewerProvider>
  )
}
