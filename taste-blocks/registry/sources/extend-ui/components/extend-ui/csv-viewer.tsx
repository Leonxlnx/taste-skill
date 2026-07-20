"use client"

import * as React from "react"
import type * as GlideDataGrid from "@glideapps/glide-data-grid"
import type {
  DataEditorRef,
  GridCell,
  GridCellKind,
  GridColumn,
  GridSelection,
  Item,
  Theme,
} from "@glideapps/glide-data-grid"
import {
  CompactSelection,
  emptyGridSelection,
} from "@glideapps/glide-data-grid"

import "@glideapps/glide-data-grid/dist/index.css"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Download01Icon,
  MinusSignCircleIcon,
  MoreHorizontalIcon,
  PlusSignCircleIcon,
  Search01Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Papa from "papaparse"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

const ZOOM_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const
const CSV_SEARCH_BATCH_ROW_COUNT = 500
const CSV_SEARCH_DEBOUNCE_MS = 300

type GlideDataGridModule = typeof GlideDataGrid
type CsvViewerProps = {
  className?: string
  data?: string
  search?: boolean
}

type CsvSearchResult = {
  col: number
  row: number
  displayValue: string
  columnTitle: string
}

function toDisplayString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value)
}

function normalizeHeaderTitle(header: string, index: number): string {
  const trimmed = header.trim()
  return trimmed.length > 0 ? trimmed : `Column ${index + 1}`
}

function columnIndexToA1(col: number) {
  let columnNumber = col + 1
  let columnName = ""

  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26
    columnName = String.fromCharCode(65 + remainder) + columnName
    columnNumber = Math.floor((columnNumber - 1) / 26)
  }

  return columnName
}

function cellAddressToA1(col: number, row: number) {
  return `${columnIndexToA1(col)}${row + 1}`
}

function cellMatchesQuery(displayValue: string, query: string) {
  return displayValue.toLowerCase().includes(query)
}

function createSingleCellSelection(cell: Item): GridSelection {
  const [col, row] = cell

  return {
    columns: CompactSelection.empty(),
    rows: CompactSelection.empty(),
    current: {
      cell,
      range: { x: col, y: row, width: 1, height: 1 },
      rangeStack: [],
    },
  }
}

async function findCsvSearchResults(
  headers: string[],
  rows: string[][],
  rawQuery: string
) {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return []

  const results: CsvSearchResult[] = []
  const columnCount = Math.max(
    headers.length,
    rows.reduce((maxCount, row) => Math.max(maxCount, row.length), 0)
  )

  for (
    let batchStartRow = 0;
    batchStartRow < rows.length;
    batchStartRow += CSV_SEARCH_BATCH_ROW_COUNT
  ) {
    const batchEndRow = Math.min(
      batchStartRow + CSV_SEARCH_BATCH_ROW_COUNT,
      rows.length
    )

    for (let row = batchStartRow; row < batchEndRow; row += 1) {
      const rowValues = rows[row] ?? []

      for (let col = 0; col < columnCount; col += 1) {
        const displayValue = rowValues[col] ?? ""
        if (!cellMatchesQuery(displayValue, query)) continue

        results.push({
          col,
          row,
          displayValue,
          columnTitle: headers[col] ?? `Column ${col + 1}`,
        })
      }
    }

    if (batchEndRow < rows.length) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0)
      })
    }
  }

  return results
}

function parseDelimitedText(text: string): {
  headers: string[]
  rows: string[][]
  error: string | null
} {
  const results = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: "greedy",
  })

  const objectRows = Array.isArray(results.data)
    ? results.data.filter(
        (row): row is Record<string, unknown> =>
          !!row && typeof row === "object" && !Array.isArray(row)
      )
    : []
  const metaFields = Array.isArray(results.meta.fields)
    ? results.meta.fields.map((field) => String(field))
    : []
  const fieldKeys =
    metaFields.length > 0
      ? metaFields
      : Object.keys(objectRows[0] ?? {}).filter(
          (key) => key !== "__parsed_extra"
        )
  const extraColumnCount = objectRows.reduce((maxCount, row) => {
    const extras = row.__parsed_extra
    return Array.isArray(extras) ? Math.max(maxCount, extras.length) : maxCount
  }, 0)
  const headers = [
    ...fieldKeys.map((field, index) => normalizeHeaderTitle(field, index)),
    ...Array.from(
      { length: extraColumnCount },
      (_, index) => `Extra ${index + 1}`
    ),
  ]

  const rows = objectRows.map((row) => {
    const baseValues = fieldKeys.map((fieldKey) =>
      toDisplayString(row[fieldKey])
    )
    const extras = Array.isArray(row.__parsed_extra)
      ? row.__parsed_extra.map((value) => toDisplayString(value))
      : []
    const paddedExtras =
      extras.length >= extraColumnCount
        ? extras.slice(0, extraColumnCount)
        : [
            ...extras,
            ...Array.from(
              { length: extraColumnCount - extras.length },
              () => ""
            ),
          ]

    return [...baseValues, ...paddedExtras]
  })

  const firstError =
    Array.isArray(results.errors) && results.errors.length > 0
      ? results.errors[0]
      : null

  return {
    headers,
    rows,
    error:
      rows.length === 0 && firstError
        ? String(firstError.message ?? "Could not parse CSV file.")
        : null,
  }
}

function ensureCsvExtension(fileName: string) {
  const lowerFileName = fileName.toLowerCase()
  return lowerFileName.endsWith(".csv") || lowerFileName.endsWith(".tsv")
    ? fileName
    : `${fileName}.csv`
}

function downloadTextFile(text: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = fileName
  anchor.rel = "noopener"
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function CsvFileActionsMenu({
  downloadDisabled,
  isPending,
  onDownload,
  onUploadClick,
}: {
  downloadDisabled: boolean
  isPending: boolean
  onDownload: () => void
  onUploadClick: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Open CSV actions"
          disabled={isPending}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem disabled={downloadDisabled} onClick={onDownload}>
          <HugeiconsIcon icon={Download01Icon} className="size-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isPending} onClick={onUploadClick}>
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <HugeiconsIcon icon={Upload01Icon} className="size-4" />
          )}
          Upload
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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

function CsvSearchPopover({
  headers,
  rows,
  gridRef,
  dataIdentity,
  controlsDisabled,
  onGridSelectionChange,
}: {
  headers: string[]
  rows: string[][]
  gridRef: React.RefObject<DataEditorRef | null>
  dataIdentity: string
  controlsDisabled: boolean
  onGridSelectionChange: (selection: GridSelection) => void
}) {
  const [searchDraft, setSearchDraft] = React.useState("")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<CsvSearchResult[]>(
    []
  )
  const [activeResultIndex, setActiveResultIndex] = React.useState(0)
  const [isSearching, setIsSearching] = React.useState(false)
  const searchRequestIdRef = React.useRef(0)
  const appliedResultKeyRef = React.useRef("")
  const activeResult = searchResults[activeResultIndex] ?? null
  const activeResultKey = activeResult
    ? `${activeResult.row}:${activeResult.col}`
    : ""
  const hasActiveQuery = Boolean(searchQuery.trim())
  const resultLabel = isSearching
    ? "Searching"
    : !hasActiveQuery
      ? "No search"
      : searchResults.length
        ? `${activeResultIndex + 1} / ${searchResults.length}`
        : "No results"

  const runSearch = React.useCallback(
    (rawQuery: string) => {
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
      void findCsvSearchResults(headers, rows, nextQuery)
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
    },
    [headers, rows]
  )

  React.useEffect(() => {
    const trimmedDraft = searchDraft.trim()

    if (!trimmedDraft) {
      runSearch("")
      return
    }

    setIsSearching(true)
    const timeoutId = window.setTimeout(() => {
      runSearch(searchDraft)
    }, CSV_SEARCH_DEBOUNCE_MS)

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
    onGridSelectionChange(emptyGridSelection)
  }, [onGridSelectionChange])

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
    onGridSelectionChange(emptyGridSelection)
  }, [dataIdentity, onGridSelectionChange])

  React.useEffect(() => {
    if (!activeResult) return

    if (appliedResultKeyRef.current === activeResultKey) return
    appliedResultKeyRef.current = activeResultKey

    const cell: Item = [activeResult.col, activeResult.row]
    onGridSelectionChange(createSingleCellSelection(cell))

    const frame = window.requestAnimationFrame(() => {
      gridRef.current?.scrollTo(
        activeResult.col,
        activeResult.row,
        "both",
        48,
        48,
        {
          vAlign: "center",
          hAlign: "center",
        }
      )
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeResult, activeResultKey, gridRef, onGridSelectionChange])

  return (
    <Popover>
      <ToolbarTooltip label="Search CSV">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Search CSV"
            disabled={controlsDisabled}
          >
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
          </Button>
        </PopoverTrigger>
      </ToolbarTooltip>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <Input
            placeholder="Search CSV"
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
                  {activeResult.columnTitle}!
                  {cellAddressToA1(activeResult.col, activeResult.row)}
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

function readIsDarkTheme() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  )
}

function useIsDarkTheme() {
  const [isDark, setIsDark] = React.useState(readIsDarkTheme)

  React.useEffect(() => {
    if (typeof document === "undefined") return

    const updateTheme = () => setIsDark(readIsDarkTheme())

    updateTheme()

    if (typeof MutationObserver === "undefined") return

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

export function CsvViewer({ className, data, search = false }: CsvViewerProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const gridRef = React.useRef<DataEditorRef | null>(null)
  const isDark = useIsDarkTheme()
  const [glide, setGlide] = React.useState<GlideDataGridModule | null>(null)
  const [zoom, setZoom] = React.useState<(typeof ZOOM_OPTIONS)[number]>(1)
  const [gridSelection, setGridSelection] =
    React.useState<GridSelection>(emptyGridSelection)
  const [parsed, setParsed] = React.useState(() =>
    data ? parseDelimitedText(data) : { headers: [], rows: [], error: null }
  )
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(
    null
  )
  const [isPending, setIsPending] = React.useState(false)
  const [dataRevision, setDataRevision] = React.useState(0)

  const dataIdentity = React.useMemo(
    () =>
      `${dataRevision}:${parsed.headers.join("\u0001")}:${parsed.rows.length}:${parsed.error ?? ""}`,
    [dataRevision, parsed.error, parsed.headers, parsed.rows.length]
  )

  const handleGridSelectionChange = React.useCallback(
    (selection: GridSelection) => {
      setGridSelection(selection)
    },
    []
  )

  React.useEffect(() => {
    if (data) {
      setParsed(parseDelimitedText(data))
      setUploadedFileName(null)
      setDataRevision((revision) => revision + 1)
    }
  }, [data])

  React.useEffect(() => {
    if (!search) {
      setGridSelection(emptyGridSelection)
    }
  }, [search])

  React.useEffect(() => {
    let mounted = true

    void import("@glideapps/glide-data-grid").then((module) => {
      if (mounted) {
        setGlide(module)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  const columnCount = Math.max(1, parsed.headers.length)
  const scale = React.useCallback(
    (value: number) => Math.round(value * zoom),
    [zoom]
  )
  const searchDisabled =
    Boolean(parsed.error) || parsed.rows.length === 0 || isPending

  const theme = React.useMemo<Partial<Theme>>(
    () => ({
      accentColor: isDark ? "#60a5fa" : "#2563eb",
      accentLight: isDark ? "#1d4ed826" : "#dbeafe",
      accentFg: "#ffffff",
      textDark: isDark ? "#e5e5e5" : "#171717",
      textMedium: isDark ? "#a3a3a3" : "#525252",
      textLight: isDark ? "#737373" : "#a3a3a3",
      textBubble: isDark ? "#f5f5f5" : "#171717",
      textHeader: isDark ? "#f5f5f5" : "#171717",
      textGroupHeader: isDark ? "#a3a3a3" : "#525252",
      bgCell: isDark ? "#0a0a0a" : "#ffffff",
      bgCellMedium: isDark ? "#171717" : "#fafafa",
      bgHeader: isDark ? "#171717" : "#fafafa",
      bgHeaderHasFocus: isDark ? "#262626" : "#f5f5f5",
      bgHeaderHovered: isDark ? "#262626" : "#f5f5f5",
      borderColor: isDark ? "#262626" : "#e5e5e5",
      horizontalBorderColor: isDark ? "#262626" : "#e5e5e5",
      cellHorizontalPadding: scale(8),
      cellVerticalPadding: Math.max(2, scale(3)),
      headerIconSize: scale(18),
      baseFontStyle: `${scale(13)}px`,
      headerFontStyle: `600 ${scale(13)}px`,
      markerFontStyle: `${scale(11)}px`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      editorFontSize: `${scale(13)}px`,
    }),
    [isDark, scale]
  )

  const columns = React.useMemo<GridColumn[]>(
    () =>
      Array.from({ length: columnCount }, (_, index) => ({
        id: `column-${index}`,
        title: parsed.headers[index] ?? `Column ${index + 1}`,
        width: scale(index === 0 ? 180 : 160),
      })),
    [columnCount, parsed.headers, scale]
  )

  const getCellContent = React.useCallback(
    ([col, row]: Item): GridCell => {
      const value = parsed.rows[row]?.[col] ?? ""
      const textKind = glide?.GridCellKind.Text as GridCellKind.Text

      return {
        kind: textKind,
        data: value,
        displayData: value,
        allowOverlay: true,
        readonly: true,
      }
    },
    [glide, parsed.rows]
  )

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsPending(true)
    try {
      const text = await file.text()
      setParsed(parseDelimitedText(text))
      setUploadedFileName(file.name)
      setDataRevision((revision) => revision + 1)
    } catch (error) {
      setParsed({
        headers: [],
        rows: [],
        error:
          error instanceof Error ? error.message : "Could not read CSV file.",
      })
      setDataRevision((revision) => revision + 1)
    } finally {
      event.target.value = ""
      setIsPending(false)
    }
  }

  function stepZoom(direction: -1 | 1) {
    const index = ZOOM_OPTIONS.indexOf(zoom)
    const nextIndex = Math.min(
      ZOOM_OPTIONS.length - 1,
      Math.max(0, index + direction)
    )
    setZoom(ZOOM_OPTIONS[nextIndex])
  }

  function handleDownload() {
    const text = Papa.unparse({
      fields: parsed.headers,
      data: parsed.rows,
    })

    downloadTextFile(
      text,
      ensureCsvExtension(uploadedFileName ?? "data.csv"),
      "text/csv;charset=utf-8"
    )
  }

  return (
    <div
      className={cn(
        "flex h-[560px] w-full flex-col overflow-hidden bg-background",
        className
      )}
    >
      <div className="flex min-h-12 flex-wrap items-center justify-end gap-2 border-b bg-background px-3 py-2">
        <TooltipProvider>
          <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-1">
            <div className="flex flex-none items-center gap-1">
              <ToolbarTooltip label="Zoom out">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Zoom out"
                  disabled={zoom <= ZOOM_OPTIONS[0]}
                  onClick={() => stepZoom(-1)}
                >
                  <HugeiconsIcon
                    icon={MinusSignCircleIcon}
                    className="size-4"
                  />
                </Button>
              </ToolbarTooltip>
              <Select
                value={zoom.toString()}
                onValueChange={(value) =>
                  setZoom(Number(value) as (typeof ZOOM_OPTIONS)[number])
                }
                modal={false}
              >
                <SelectTrigger
                  size="sm"
                  className="w-[84px] min-w-[84px]"
                  aria-label="Zoom level"
                >
                  <SelectValue>{Math.round(zoom * 100)}%</SelectValue>
                </SelectTrigger>
                <SelectContent align="end" alignItemWithTrigger={false}>
                  {ZOOM_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {Math.round(option * 100)}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ToolbarTooltip label="Zoom in">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Zoom in"
                  disabled={zoom >= ZOOM_OPTIONS[ZOOM_OPTIONS.length - 1]}
                  onClick={() => stepZoom(1)}
                >
                  <HugeiconsIcon icon={PlusSignCircleIcon} className="size-4" />
                </Button>
              </ToolbarTooltip>
            </div>
            {search ? (
              <>
                <Separator
                  orientation="vertical"
                  className="mx-1 h-4 self-center"
                />
                <CsvSearchPopover
                  headers={parsed.headers}
                  rows={parsed.rows}
                  gridRef={gridRef}
                  dataIdentity={dataIdentity}
                  controlsDisabled={searchDisabled}
                  onGridSelectionChange={handleGridSelectionChange}
                />
              </>
            ) : null}
            <Separator
              orientation="vertical"
              className="mx-1 h-4 self-center"
            />
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.tsv,text/csv,text/tab-separated-values"
              className="hidden"
              onChange={handleUpload}
            />
            <CsvFileActionsMenu
              downloadDisabled={
                Boolean(parsed.error) ||
                isPending ||
                (parsed.headers.length === 0 && parsed.rows.length === 0)
              }
              isPending={isPending}
              onDownload={handleDownload}
              onUploadClick={() => inputRef.current?.click()}
            />
          </div>
        </TooltipProvider>
      </div>
      <div className="min-h-0 flex-1">
        {parsed.error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {parsed.error}
          </div>
        ) : parsed.rows.length === 0 ? (
          <div className="grid h-full place-items-center bg-muted/30 p-4">
            <div className="max-w-md rounded-lg border bg-background p-4 text-center text-sm shadow-xs">
              <p className="font-medium">Upload a CSV to preview</p>
              <p className="mt-1 text-muted-foreground">
                Pass delimited text with the <code>data</code> prop or upload a
                CSV file.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                loading={isPending}
                onClick={() => inputRef.current?.click()}
              >
                <HugeiconsIcon icon={Upload01Icon} className="size-4" />
                Upload CSV
              </Button>
            </div>
          </div>
        ) : !glide ? (
          <div className="grid h-full place-items-center bg-background">
            <Spinner className="size-4" />
          </div>
        ) : (
          <glide.DataEditor
            ref={search ? gridRef : undefined}
            key={zoom}
            columns={columns}
            rows={parsed.rows.length}
            getCellContent={getCellContent}
            rowMarkers="number"
            rowSelectionMode="multi"
            gridSelection={search ? gridSelection : undefined}
            onGridSelectionChange={
              search ? handleGridSelectionChange : undefined
            }
            scrollToActiveCell={search}
            keybindings={{ search: true }}
            smoothScrollX
            smoothScrollY
            getCellsForSelection
            width="100%"
            height="100%"
            theme={theme}
            rowHeight={scale(34)}
            headerHeight={scale(36)}
          />
        )}
      </div>
    </div>
  )
}
