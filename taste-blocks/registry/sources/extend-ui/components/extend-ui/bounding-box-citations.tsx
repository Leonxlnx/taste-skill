"use client"

import * as React from "react"
import {
  DataEditor,
  emptyGridSelection,
  GridCellKind,
  TextCellEntry,
  type EditableGridCell,
  type GridCell,
  type GridColumn,
  type GridMouseEventArgs,
  type GridSelection,
  type Item,
  type NumberCell,
  type ProvideEditorComponent,
  type Rectangle,
  type TextCell,
  type Theme,
} from "@glideapps/glide-data-grid"
import {
  ArrowLeft01Icon,
  CancelCircleIcon,
  InputNumericIcon,
  InputTextIcon,
  SecondBracketIcon,
  SourceCodeSquareIcon,
  TextCheckIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Virtualizer as DiffsVirtualizer } from "@pierre/diffs"
import {
  File,
  MultiFileDiff,
  VirtualizerContext,
  WorkerPoolContextProvider,
  type VirtualFileMetrics,
  type WorkerInitializationRenderOptions,
  type WorkerPoolOptions,
} from "@pierre/diffs/react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import "@glideapps/glide-data-grid/dist/index.css"

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]
export type SchemaPropertyType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"

export type ReviewFieldSchema = {
  type: SchemaPropertyType
  title?: string
  description?: string
  enum?: Array<string | number>
  properties?: Record<string, ReviewFieldSchema>
  items?: ReviewFieldSchema
}

export type HighlightArea = {
  left: number
  top: number
  width: number
  height: number
}

export type ReviewField = {
  key: string
  schema: ReviewFieldSchema
  actual: JsonValue
  expected: JsonValue
  location?: ReviewLocation
  metadataPath?: string
}

export type ReviewLocation = {
  page: number
  area: HighlightArea
}

export type ReviewCitation = {
  page: number
  polygon?: Array<{ x: number; y: number }>
  pageWidth: number
  pageHeight: number
}

export type ReviewMetadataEntry = {
  citations?: ReviewCitation[]
}

function ScrollAreaVirtualizer({
  children,
  className,
  contentClassName,
  contentStyle,
  scrollFade = true,
}: {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  contentStyle?: React.CSSProperties
  scrollFade?: boolean
}) {
  const [virtualizer] = React.useState(() =>
    typeof window !== "undefined" ? new DiffsVirtualizer() : undefined
  )
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const syncVirtualizer = React.useCallback(() => {
    if (!virtualizer) return

    const viewport = viewportRef.current
    const content = contentRef.current

    if (viewport && content) {
      virtualizer.setup(viewport, content)
      return
    }

    virtualizer.cleanUp()
  }, [virtualizer])
  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      syncVirtualizer()
    },
    [syncVirtualizer]
  )
  const setContentRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node
      syncVirtualizer()
    },
    [syncVirtualizer]
  )

  React.useEffect(() => {
    return () => virtualizer?.cleanUp()
  }, [virtualizer])

  return (
    <VirtualizerContext.Provider value={virtualizer}>
      <ScrollArea
        className={className}
        scrollFade={scrollFade}
        scrollbarOverflowOnly
        viewportRef={setViewportRef}
      >
        <div
          ref={setContentRef}
          className={contentClassName}
          style={contentStyle}
        >
          {children}
        </div>
      </ScrollArea>
    </VirtualizerContext.Provider>
  )
}

const DEFAULT_ZOOM = 1
const REVIEW_HIGHLIGHT_STYLE =
  "border-blue-500/70 bg-blue-500/12 shadow-[0_4px_16px_rgb(59_130_246_/_10%)]"

const CODE_FILE_THEME = {
  "--diffs-light-bg": "var(--color-code)",
  "--diffs-dark-bg": "var(--color-code)",
  "--diffs-light": "var(--color-code-foreground)",
  "--diffs-dark": "var(--color-code-foreground)",
  "--diffs-bg-context-override": "var(--color-code)",
  "--diffs-bg-context-gutter-override": "var(--color-code)",
  "--diffs-bg-buffer-override": "var(--color-code)",
  "--diffs-fg-number-override": "var(--color-muted-foreground)",
  "--diffs-font-size": "0.8rem",
  "--diffs-line-height": "1.625",
} as React.CSSProperties

const CODE_FONT_SIZE_PX = 12.8
const CODE_LINE_HEIGHT_PX = CODE_FONT_SIZE_PX * 1.625

const CODE_VIRTUAL_FILE_METRICS = {
  hunkLineCount: 50,
  lineHeight: CODE_LINE_HEIGHT_PX,
  diffHeaderHeight: 44,
  spacing: 8,
  paddingTop: 0,
  paddingBottom: 8,
} satisfies VirtualFileMetrics

const CODE_HIGHLIGHTER_OPTIONS = {
  theme: {
    light: "pierre-light-soft",
    dark: "pierre-dark-soft",
  },
  langs: ["json"],
} satisfies WorkerInitializationRenderOptions

const CODE_WORKER_POOL_OPTIONS = {
  workerFactory: () =>
    new Worker(new URL("@pierre/diffs/worker/worker.js", import.meta.url), {
      type: "module",
    }),
} satisfies WorkerPoolOptions

function readIsDarkTheme() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  )
}

// A single shared MutationObserver backs every consumer. Each grid previously
// created its own observer (two, via useHumanReviewGridTheme), so opening a
// nested array view spun up and tore down several observers at once.
const darkThemeListeners = new Set<(isDark: boolean) => void>()
let darkThemeObserver: MutationObserver | null = null
let sharedIsDarkTheme = false

function ensureDarkThemeObserver() {
  if (
    darkThemeObserver ||
    typeof document === "undefined" ||
    typeof MutationObserver === "undefined"
  ) {
    return
  }

  sharedIsDarkTheme = readIsDarkTheme()
  darkThemeObserver = new MutationObserver(() => {
    const nextIsDark = readIsDarkTheme()
    if (nextIsDark === sharedIsDarkTheme) return

    sharedIsDarkTheme = nextIsDark
    darkThemeListeners.forEach((listener) => listener(nextIsDark))
  })
  darkThemeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
}

function useIsDarkTheme() {
  const [isDark, setIsDark] = React.useState(readIsDarkTheme)

  React.useEffect(() => {
    ensureDarkThemeObserver()
    setIsDark(sharedIsDarkTheme)
    darkThemeListeners.add(setIsDark)

    return () => {
      darkThemeListeners.delete(setIsDark)
      if (darkThemeListeners.size === 0 && darkThemeObserver) {
        darkThemeObserver.disconnect()
        darkThemeObserver = null
      }
    }
  }, [])

  return isDark
}

function useHumanReviewGridTheme() {
  const isDark = useIsDarkTheme()

  return React.useMemo<Partial<Theme>>(
    () => ({
      accentColor: isDark ? "rgb(96, 165, 250)" : "rgb(37, 99, 235)",
      accentLight: isDark ? "rgba(29, 78, 216, 0.15)" : "rgb(219, 234, 254)",
      accentFg: "rgb(255, 255, 255)",
      textDark: isDark ? "rgb(229, 229, 229)" : "rgb(23, 23, 23)",
      textMedium: isDark ? "rgb(163, 163, 163)" : "rgb(82, 82, 82)",
      textLight: isDark ? "rgb(115, 115, 115)" : "rgb(163, 163, 163)",
      textBubble: isDark ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)",
      textHeader: isDark ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)",
      textGroupHeader: isDark ? "rgb(163, 163, 163)" : "rgb(82, 82, 82)",
      bgCell: isDark ? "rgb(10, 10, 10)" : "rgb(255, 255, 255)",
      bgCellMedium: isDark ? "rgb(23, 23, 23)" : "rgb(250, 250, 250)",
      bgHeader: isDark ? "rgb(23, 23, 23)" : "rgb(250, 250, 250)",
      bgHeaderHasFocus: isDark ? "rgb(38, 38, 38)" : "rgb(245, 245, 245)",
      bgHeaderHovered: isDark ? "rgb(38, 38, 38)" : "rgb(245, 245, 245)",
      borderColor: isDark ? "rgb(38, 38, 38)" : "rgb(229, 229, 229)",
      horizontalBorderColor: isDark ? "rgb(38, 38, 38)" : "rgb(229, 229, 229)",
      cellHorizontalPadding: 8,
      cellVerticalPadding: 3,
      headerIconSize: 18,
      baseFontStyle: "13px",
      headerFontStyle: "600 13px",
      markerFontStyle: "11px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      editorFontSize: "13px",
    }),
    [isDark]
  )
}

export const REVIEW_FIELDS: ReviewField[] = [
  {
    key: "statement_period",
    schema: {
      type: "string",
      title: "Statement period",
      description: "Date range covered by the bank statement.",
    },
    actual: "Jan 1-31, 2026",
    expected: "January 1-31, 2026",
    location: {
      page: 1,
      area: { left: 31, top: 30, width: 40, height: 5.8 },
    },
  },
  {
    key: "transactions",
    schema: {
      type: "array",
      title: "Transactions",
      description: "Posted account activity during the statement period.",
      items: {
        type: "object",
        properties: {
          date: {
            type: "string",
            title: "Date",
          },
          description: {
            type: "string",
            title: "Description",
          },
          amount: {
            type: "number",
            title: "Amount",
          },
          category: {
            type: "string",
            title: "Category",
          },
          merchant: {
            type: "object",
            title: "Merchant",
            properties: {
              name: {
                type: "string",
                title: "Name",
              },
              city: {
                type: "string",
                title: "City",
              },
              risk_level: {
                type: "string",
                title: "Risk level",
              },
            },
          },
          tags: {
            type: "array",
            title: "Tags",
            items: {
              type: "string",
              title: "Tag",
            },
          },
        },
      },
    },
    actual: [
      {
        date: "2026-01-03",
        description: "ACH CREDIT PAYROLL",
        amount: 4250,
        category: "Deposit",
        merchant: {
          name: "Acme Payroll",
          city: "New York",
          risk_level: "low",
        },
        tags: ["payroll", "recurring"],
      },
      {
        date: "2026-01-12",
        description: "POS PURCHASE GROCERY MART",
        amount: -86.42,
        category: "Debit",
        merchant: {
          name: "Grocery Mart",
          city: "Brooklyn",
          risk_level: "medium",
        },
        tags: ["card", "groceries"],
      },
    ],
    expected: [
      {
        date: "2026-01-03",
        description: "ACH CREDIT PAYROLL",
        amount: 4250,
        category: "Deposit",
        merchant: {
          name: "Acme Payroll",
          city: "New York",
          risk_level: "low",
        },
        tags: ["payroll", "recurring"],
      },
      {
        date: "2026-01-12",
        description: "POS PURCHASE GROCERY MART",
        amount: -68.42,
        category: "Debit",
        merchant: {
          name: "Grocery Mart",
          city: "Brooklyn",
          risk_level: "low",
        },
        tags: ["card", "groceries", "needs_review"],
      },
    ],
    location: {
      page: 1,
      area: { left: 13.5, top: 66, width: 73.5, height: 7.5 },
    },
  },
  {
    key: "ending_balance",
    schema: {
      type: "number",
      title: "Ending balance",
      description: "Final account balance at the end of the statement period.",
    },
    actual: 12840.18,
    expected: 12858.18,
    location: {
      page: 1,
      area: { left: 13.5, top: 66, width: 73.5, height: 7.5 },
    },
  },
  {
    key: "overdraft_protection_enabled",
    schema: {
      type: "boolean",
      title: "Overdraft protection enabled",
      description: "Whether overdraft protection is enabled for the account.",
    },
    actual: false,
    expected: true,
    location: {
      page: 2,
      area: { left: 9.5, top: 12, width: 81, height: 11.5 },
    },
  },
  {
    key: "account_details",
    schema: {
      type: "object",
      title: "Account details",
      description: "Account owner and identifying details from the statement.",
      properties: {
        holder_name: {
          type: "string",
          title: "Holder name",
        },
        account_last_four: {
          type: "string",
          title: "Account last four",
        },
        account_type: {
          type: "string",
          title: "Account type",
        },
        mailing_address: {
          type: "object",
          title: "Mailing address",
          properties: {
            line_1: {
              type: "string",
              title: "Line 1",
            },
            city: {
              type: "string",
              title: "City",
            },
            state: {
              type: "string",
              title: "State",
            },
          },
        },
        linked_accounts: {
          type: "array",
          title: "Linked accounts",
          items: {
            type: "object",
            properties: {
              nickname: {
                type: "string",
                title: "Nickname",
              },
              last_four: {
                type: "string",
                title: "Last four",
              },
            },
          },
        },
      },
    },
    actual: {
      holder_name: "Jordan Lee",
      account_last_four: "4821",
      account_type: "Checking",
      mailing_address: {
        line_1: "42 Market Street",
        city: "Brooklyn",
        state: "NY",
      },
      linked_accounts: [
        {
          nickname: "Operations reserve",
          last_four: "1842",
        },
      ],
    },
    expected: {
      holder_name: "Jordan Lee",
      account_last_four: "4821",
      account_type: "Premier Checking",
      mailing_address: {
        line_1: "42 Market Street",
        city: "New York",
        state: "NY",
      },
      linked_accounts: [
        {
          nickname: "Operations reserve",
          last_four: "1842",
        },
        {
          nickname: "Payroll sweep",
          last_four: "9174",
        },
      ],
    },
  },
]

function getCitationLocation(
  citation: ReviewCitation
): ReviewLocation | undefined {
  const polygon = citation.polygon
  if (!polygon?.length || !citation.pageWidth || !citation.pageHeight) {
    return undefined
  }

  const xs = polygon.map((point) => point.x)
  const ys = polygon.map((point) => point.y)
  const left = Math.min(...xs)
  const top = Math.min(...ys)
  const right = Math.max(...xs)
  const bottom = Math.max(...ys)

  return {
    page: citation.page,
    area: {
      left: (left / citation.pageWidth) * 100,
      top: (top / citation.pageHeight) * 100,
      width: ((right - left) / citation.pageWidth) * 100,
      height: ((bottom - top) / citation.pageHeight) * 100,
    },
  }
}

export function getMetadataLocation(
  metadata: Record<string, ReviewMetadataEntry> | undefined,
  metadataPath: string | undefined
) {
  if (!metadata || !metadataPath) return undefined

  const citation = metadata[metadataPath]?.citations?.find(
    (candidate) => candidate.polygon?.length
  )

  return citation ? getCitationLocation(citation) : undefined
}

export function getReviewFieldLocation(
  field: ReviewField | undefined,
  resolveLocation?: (metadataPath: string) => ReviewLocation | undefined
) {
  if (!field) return undefined

  return (
    field.location ??
    resolveLocation?.(field.metadataPath ?? field.key) ??
    undefined
  )
}

export function getReviewLocationKey(location: ReviewLocation | undefined) {
  if (!location) return null

  const { area } = location
  return [location.page, area.left, area.top, area.width, area.height].join(":")
}

function valuesFromFields(
  fields: ReviewField[],
  valueKey: "actual" | "expected"
) {
  return fields.reduce<JsonObject>((values, field) => {
    values[field.key] = field[valueKey]
    return values
  }, {})
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function isJsonObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isJsonArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value)
}

function getObjectValue(value: JsonValue, key: string): JsonValue {
  if (!isJsonObject(value)) return null
  return value[key] ?? null
}

function setObjectValue(
  value: JsonValue,
  key: string,
  childValue: JsonValue
): JsonObject {
  return {
    ...(isJsonObject(value) ? value : {}),
    [key]: childValue,
  }
}

function getArrayValue(value: JsonValue): JsonArray {
  return isJsonArray(value) ? value : []
}

function setArrayItemValue(
  value: JsonValue,
  index: number,
  childValue: JsonValue
): JsonArray {
  const nextValue = getArrayValue(value).slice()
  nextValue[index] = childValue
  return nextValue
}

function getPrimitiveValue(value: JsonValue): JsonPrimitive {
  return isJsonObject(value) || isJsonArray(value) ? null : value
}

function jsonValuesEqual(left: JsonValue, right: JsonValue) {
  return formatJson(left) === formatJson(right)
}

export function findReviewField(
  fields: ReviewField[],
  fieldKey: string | undefined
): ReviewField | undefined {
  if (!fieldKey) return undefined

  for (const field of fields) {
    if (field.key === fieldKey) return field

    if (field.schema.type === "object") {
      const childFields = Object.entries(field.schema.properties ?? {}).map(
        ([key, schema]): ReviewField => ({
          key: `${field.key}.${key}`,
          schema,
          actual: getObjectValue(field.actual, key),
          expected: getObjectValue(field.expected, key),
          metadataPath: `${field.metadataPath ?? field.key}.${key}`,
        })
      )
      const childField = findReviewField(childFields, fieldKey)
      if (childField) return childField
    }
  }

  return undefined
}

function formatValue(value: JsonValue) {
  if (value === null) return "NULL"
  if (isJsonObject(value) || isJsonArray(value)) return formatJson(value)
  if (typeof value === "boolean") return value ? "true" : "false"
  return String(value)
}

function areGridRangesEqual(
  left: Readonly<Rectangle> | undefined,
  right: Readonly<Rectangle> | undefined
) {
  return (
    left === right ||
    (left !== undefined &&
      right !== undefined &&
      left.x === right.x &&
      left.y === right.y &&
      left.width === right.width &&
      left.height === right.height)
  )
}

function areGridRangeStacksEqual(
  left: readonly Readonly<Rectangle>[] | undefined,
  right: readonly Readonly<Rectangle>[] | undefined
) {
  if (left === right) return true
  if (!left || !right || left.length !== right.length) return false

  return left.every((range, index) => areGridRangesEqual(range, right[index]))
}

function areGridSelectionsEqual(left: GridSelection, right: GridSelection) {
  const leftCurrent = left.current
  const rightCurrent = right.current

  return (
    leftCurrent?.cell[0] === rightCurrent?.cell[0] &&
    leftCurrent?.cell[1] === rightCurrent?.cell[1] &&
    areGridRangesEqual(leftCurrent?.range, rightCurrent?.range) &&
    areGridRangeStacksEqual(
      leftCurrent?.rangeStack,
      rightCurrent?.rangeStack
    ) &&
    left.columns.equals(right.columns) &&
    left.rows.equals(right.rows)
  )
}

function getGridSelectionRanges(selection: GridSelection | undefined) {
  const current = selection?.current
  if (!current) return []

  return [...(current.rangeStack ?? []), current.range]
}

function areArrayNestedViewsEqual(
  left: ArrayNestedView[],
  right: ArrayNestedView[]
) {
  if (left === right) return true
  if (left.length !== right.length) return false

  return left.every((view, index) => {
    const other = right[index]

    return (
      view.rowIndex === other?.rowIndex &&
      view.columnId === other.columnId &&
      view.title === other.title &&
      view.schema === other.schema &&
      Object.is(view.value, other.value)
    )
  })
}

type HumanReviewOverlayCell = TextCell | NumberCell

type HumanReviewTextOverlayEditorProps = React.ComponentProps<
  ProvideEditorComponent<HumanReviewOverlayCell>
> & {
  overlayOpenRef: React.RefObject<boolean>
  readOnly?: boolean
}

function HumanReviewTextOverlayEditor({
  isHighlighted,
  onFinishedEditing,
  overlayOpenRef,
  readOnly = false,
  validatedSelection,
  value,
}: HumanReviewTextOverlayEditorProps) {
  const initialValue =
    value.kind === GridCellKind.Number ? value.displayData : value.data
  const [entryValue, setEntryValue] = React.useState(initialValue)
  const latestValueRef = React.useRef(initialValue)
  const finishedRef = React.useRef(false)

  const finishEditing = React.useCallback(
    (
      shouldSave: boolean,
      movement: readonly [-1 | 0 | 1, -1 | 0 | 1] = [0, 0]
    ) => {
      if (finishedRef.current) return

      finishedRef.current = true
      overlayOpenRef.current = false

      if (!shouldSave || readOnly) {
        onFinishedEditing(undefined, movement)
        return
      }

      if (value.kind === GridCellKind.Number) {
        const numericValue = Number(latestValueRef.current)

        onFinishedEditing(
          {
            ...value,
            data: Number.isFinite(numericValue) ? numericValue : value.data,
            displayData: latestValueRef.current,
          },
          movement
        )
        return
      }

      onFinishedEditing(
        {
          ...value,
          data: latestValueRef.current,
          displayData: latestValueRef.current,
        },
        movement
      )
    },
    [onFinishedEditing, overlayOpenRef, readOnly, value]
  )

  const handleEntryChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      event.stopPropagation()
      latestValueRef.current = event.target.value
      setEntryValue(event.target.value)
    },
    []
  )
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      event.stopPropagation()

      if (event.key === "Escape") {
        event.preventDefault()
        finishEditing(false)
        return
      }

      if (event.key === "Tab") {
        event.preventDefault()
        finishEditing(true, [event.shiftKey ? -1 : 1, 0])
        return
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        finishEditing(true, [0, 1])
      }
    },
    [finishEditing]
  )

  React.useEffect(() => {
    overlayOpenRef.current = true

    return () => {
      overlayOpenRef.current = false
    }
  }, [overlayOpenRef])

  React.useEffect(() => {
    const handlePointerOutside = (event: PointerEvent | MouseEvent) => {
      const input = document.querySelector<HTMLTextAreaElement>(".gdg-input")
      const overlayRoot = input?.closest(".gdg-clip-region")

      if (!overlayRoot || overlayRoot.contains(event.target as Node | null)) {
        return
      }

      finishEditing(true)
    }

    document.addEventListener("pointerdown", handlePointerOutside, true)
    document.addEventListener("contextmenu", handlePointerOutside, true)

    return () => {
      document.removeEventListener("pointerdown", handlePointerOutside, true)
      document.removeEventListener("contextmenu", handlePointerOutside, true)
    }
  }, [finishEditing])

  return (
    <TextCellEntry
      autoFocus={!readOnly}
      disabled={readOnly}
      highlight={isHighlighted}
      value={entryValue}
      validatedSelection={validatedSelection}
      altNewline
      onChange={handleEntryChange}
      onKeyDown={handleKeyDown}
    />
  )
}

function getFieldIcon(type: SchemaPropertyType) {
  if (type === "number" || type === "integer") return InputNumericIcon
  if (type === "boolean") return TextCheckIcon
  if (type === "array") return SecondBracketIcon
  if (type === "object") return SourceCodeSquareIcon
  return InputTextIcon
}

function HumanReviewValueInput({
  readOnly = false,
  schema,
  value,
  onChange,
}: {
  readOnly?: boolean
  schema: ReviewFieldSchema
  value: JsonPrimitive
  onChange: (value: JsonPrimitive) => void
}) {
  if (schema.enum?.length) {
    return (
      <span className="relative inline-flex w-full rounded-lg border border-input bg-background text-sm text-foreground shadow-xs/5 dark:bg-input/32">
        <select
          disabled={readOnly}
          value={value === null ? "" : String(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-8.5 w-full appearance-none rounded-[inherit] bg-transparent px-3 text-sm outline-none sm:h-7.5"
        >
          {schema.enum.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      </span>
    )
  }

  if (schema.type === "number" || schema.type === "integer") {
    return (
      <Input
        nativeInput
        readOnly={readOnly}
        type="number"
        value={value === null ? "" : String(value)}
        onChange={(event) => {
          const nextValue = event.currentTarget.value
          onChange(nextValue === "" ? null : Number(nextValue))
        }}
      />
    )
  }

  if (schema.type === "boolean") {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-0.5">
        {[true, false].map((option) => (
          <Button
            key={String(option)}
            type="button"
            size="sm"
            variant={value === option ? "outline" : "ghost"}
            className={cn(
              "h-7 shadow-none",
              value === option && "bg-background dark:bg-input"
            )}
            disabled={readOnly}
            onClick={() => onChange(option)}
          >
            {option ? "True" : "False"}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <Input
      nativeInput
      readOnly={readOnly}
      value={value === null ? "" : String(value)}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  )
}

function getArrayItemSchema(schema: ReviewFieldSchema): ReviewFieldSchema {
  return schema.items ?? { type: "string" }
}

function isComplexSchema(schema: ReviewFieldSchema) {
  return schema.type === "object" || schema.type === "array"
}

function summarizeComplexValue(value: JsonValue) {
  if (isJsonArray(value)) return `${value.length} items`
  if (isJsonObject(value)) return `${Object.keys(value).length} fields`
  return formatValue(value)
}

function getCellValueForArrayColumn(
  rowValue: JsonValue,
  itemSchema: ReviewFieldSchema,
  columnId: string
) {
  if (itemSchema.type === "object") {
    return getObjectValue(rowValue, columnId)
  }

  return rowValue
}

function getCellSchemaForArrayColumn(
  itemSchema: ReviewFieldSchema,
  columnId: string
) {
  if (itemSchema.type === "object") {
    return itemSchema.properties?.[columnId] ?? { type: "string" }
  }

  return itemSchema
}

function applyPrimitiveEdit(
  schema: ReviewFieldSchema,
  value: EditableGridCell
): JsonValue | undefined {
  if (schema.type === "boolean" && value.kind === GridCellKind.Boolean) {
    return value.data
  }

  if (
    (schema.type === "number" || schema.type === "integer") &&
    value.kind === GridCellKind.Number
  ) {
    return value.data ?? null
  }

  if (value.kind === GridCellKind.Text) {
    if (schema.type === "number" || schema.type === "integer") {
      return value.data.trim() === "" ? null : Number(value.data)
    }

    return value.data
  }

  return undefined
}

type ArrayNestedView = {
  rowIndex: number
  columnId: string
  title: string
  schema: ReviewFieldSchema
  value: JsonValue
}

type ArrayReviewSide = "actual" | "expected"

type SyncedArrayNestedView = {
  activeSide: ArrayReviewSide | null
  stack: ArrayNestedView[]
}

type SyncedArraySelection = {
  activeSide: ArrayReviewSide | null
  depth: number
  gridSelection: GridSelection
}

export type HumanReviewTheme = "light" | "dark"

const EMPTY_SYNCED_ARRAY_NESTED_VIEW: SyncedArrayNestedView = {
  activeSide: null,
  stack: [],
}

const EMPTY_SYNCED_ARRAY_SELECTION: SyncedArraySelection = {
  activeSide: null,
  depth: 0,
  gridSelection: emptyGridSelection,
}

function setNestedArrayValue({
  value,
  schema,
  nestedStack,
  nextNestedValue,
}: {
  value: JsonValue
  schema: ReviewFieldSchema
  nestedStack: ArrayNestedView[]
  nextNestedValue: JsonValue
}): JsonValue {
  const [currentView, ...remainingViews] = nestedStack

  if (!currentView) return nextNestedValue

  const itemSchema = getArrayItemSchema(schema)
  const rowValue = getArrayValue(value)[currentView.rowIndex] ?? null
  const cellSchema = getCellSchemaForArrayColumn(
    itemSchema,
    currentView.columnId
  )
  const currentCellValue = getCellValueForArrayColumn(
    rowValue,
    itemSchema,
    currentView.columnId
  )
  const nextCellValue: JsonValue = remainingViews.length
    ? setNestedArrayValue({
        value: currentCellValue,
        schema: cellSchema,
        nestedStack: remainingViews,
        nextNestedValue,
      })
    : nextNestedValue
  const nextRowValue: JsonValue =
    itemSchema.type === "object"
      ? setObjectValue(rowValue, currentView.columnId, nextCellValue)
      : nextCellValue

  return setArrayItemValue(value, currentView.rowIndex, nextRowValue)
}

function getNestedArrayValue({
  value,
  schema,
  nestedStack,
}: {
  value: JsonValue
  schema: ReviewFieldSchema
  nestedStack: ArrayNestedView[]
}): JsonValue {
  const [currentView, ...remainingViews] = nestedStack

  if (!currentView) return value

  const itemSchema = getArrayItemSchema(schema)
  const rowValue = getArrayValue(value)[currentView.rowIndex] ?? null
  const cellSchema = getCellSchemaForArrayColumn(
    itemSchema,
    currentView.columnId
  )
  const cellValue = getCellValueForArrayColumn(
    rowValue,
    itemSchema,
    currentView.columnId
  )

  if (!remainingViews.length) return cellValue

  return getNestedArrayValue({
    value: cellValue,
    schema: cellSchema,
    nestedStack: remainingViews,
  })
}

function HumanReviewArrayValueGrid({
  activeNestedSide = null,
  activeSelectionSide = null,
  label,
  nestedStackBaseDepth = 0,
  readOnly = false,
  schema,
  selectionDepth = 0,
  sharedGridSelection,
  sharedNestedStack,
  value,
  viewSide = "expected",
  metadataPath,
  onChange,
  onGridSelectionChange,
  onLocationHover,
  onNestedStackChange,
  resolveArrayItemMetadataPath,
  resolveLocation,
}: {
  activeNestedSide?: ArrayReviewSide | null
  activeSelectionSide?: ArrayReviewSide | null
  label: string
  nestedStackBaseDepth?: number
  readOnly?: boolean
  schema: ReviewFieldSchema
  selectionDepth?: number
  sharedGridSelection?: GridSelection
  sharedNestedStack?: ArrayNestedView[]
  value: JsonValue
  viewSide?: ArrayReviewSide
  metadataPath?: string
  onChange?: (value: JsonValue) => void
  onGridSelectionChange?: (
    selection: GridSelection,
    side: ArrayReviewSide,
    depth: number
  ) => void
  onNestedStackChange?: (
    stack: ArrayNestedView[],
    side: ArrayReviewSide
  ) => void
  onLocationHover?: (location?: ReviewLocation) => void
  resolveArrayItemMetadataPath?: (
    metadataPath: string,
    rowIndex: number,
    rowValue: JsonValue
  ) => string | undefined
  resolveLocation?: (metadataPath: string) => ReviewLocation | undefined
}) {
  const rows = getArrayValue(value)
  const itemSchema = getArrayItemSchema(schema)
  const gridTheme = useHumanReviewGridTheme()
  const isDark = useIsDarkTheme()
  const [localNestedStack, setLocalNestedStack] = React.useState<
    ArrayNestedView[]
  >([])
  const [localGridSelection, setLocalGridSelection] =
    React.useState<GridSelection>(emptyGridSelection)
  const fastTextOverlayOpenRef = React.useRef(false)
  const nestedStack = sharedNestedStack ?? localNestedStack
  const visibleNestedStack = nestedStack.slice(nestedStackBaseDepth)
  const activeNestedView = visibleNestedStack[0] ?? null
  const activeNestedValue = activeNestedView
    ? getNestedArrayValue({
        value,
        schema,
        nestedStack: [activeNestedView],
      })
    : null
  const isActiveNestedSource =
    Boolean(activeNestedView) && activeNestedSide === viewSide
  const isMirroredNestedTarget =
    Boolean(activeNestedView) &&
    activeNestedSide !== null &&
    activeNestedSide !== viewSide
  const blueCellText = isDark ? "rgb(147, 197, 253)" : "rgb(37, 99, 235)"
  const selectedCellBackground = isDark
    ? "rgba(37, 99, 235, 0.2)"
    : "rgba(219, 234, 254, 0.85)"
  const mirroredCellBackground = isDark
    ? "rgba(167, 139, 250, 0.18)"
    : "rgba(237, 233, 254, 0.9)"
  const mirroredHighlightRegions = React.useMemo<
    React.ComponentProps<typeof DataEditor>["highlightRegions"]
  >(() => {
    if (
      !activeSelectionSide ||
      activeSelectionSide === viewSide ||
      selectionDepth !== nestedStackBaseDepth
    ) {
      return undefined
    }

    const ranges = getGridSelectionRanges(sharedGridSelection)
    if (!ranges.length) return undefined

    return ranges.map((range) => ({
      color: mirroredCellBackground,
      range,
      style: "dashed" as const,
    }))
  }, [
    activeSelectionSide,
    mirroredCellBackground,
    nestedStackBaseDepth,
    selectionDepth,
    sharedGridSelection,
    viewSide,
  ])

  const setNestedStack = React.useCallback(
    (
      updater:
        | ArrayNestedView[]
        | ((current: ArrayNestedView[]) => ArrayNestedView[])
    ) => {
      if (onNestedStackChange) {
        const nextStack =
          typeof updater === "function" ? updater(nestedStack) : updater

        onNestedStackChange(nextStack, viewSide)
        return
      }

      setLocalNestedStack(updater)
    },
    [nestedStack, onNestedStackChange, viewSide]
  )

  const handleGridSelectionChange = React.useCallback(
    (selection: GridSelection) => {
      flushSync(() => {
        setLocalGridSelection((current) =>
          areGridSelectionsEqual(current, selection) ? current : selection
        )
      })

      if (onGridSelectionChange) {
        if (
          activeSelectionSide === viewSide &&
          sharedGridSelection &&
          areGridSelectionsEqual(sharedGridSelection, selection)
        ) {
          return
        }

        React.startTransition(() => {
          onGridSelectionChange(selection, viewSide, nestedStackBaseDepth)
        })
        return
      }
    },
    [
      activeSelectionSide,
      nestedStackBaseDepth,
      onGridSelectionChange,
      sharedGridSelection,
      viewSide,
    ]
  )

  const columns = React.useMemo<GridColumn[]>(() => {
    if (itemSchema.type === "object") {
      const propertyEntries = Object.entries(itemSchema.properties ?? {})

      if (propertyEntries.length) {
        return propertyEntries.map(([key, propertySchema]) => ({
          id: key,
          title: propertySchema.title ?? key,
          width: isComplexSchema(propertySchema) ? 148 : 132,
        }))
      }
    }

    return [
      {
        id: "value",
        title: itemSchema.title ?? "Value",
        width: isComplexSchema(itemSchema) ? 148 : 180,
      },
    ]
  }, [itemSchema])

  const getCellContent = React.useCallback(
    ([col, row]: Item): GridCell => {
      const column = columns[col]
      const columnId = String(column?.id ?? "value")
      const rowValue = rows[row] ?? null
      const cellSchema = getCellSchemaForArrayColumn(itemSchema, columnId)
      const cellValue = getCellValueForArrayColumn(
        rowValue,
        itemSchema,
        columnId
      )
      const matchedNestedCell =
        activeNestedView?.rowIndex === row &&
        activeNestedView.columnId === columnId
      const nestedCellTheme: Partial<Theme> | undefined = matchedNestedCell
        ? {
            bgCell: isMirroredNestedTarget
              ? mirroredCellBackground
              : selectedCellBackground,
            textDark: blueCellText,
          }
        : undefined

      if (isComplexSchema(cellSchema)) {
        return {
          kind: GridCellKind.Text,
          data: summarizeComplexValue(cellValue),
          displayData: summarizeComplexValue(cellValue),
          allowOverlay: false,
          readonly: true,
          cursor: "pointer",
          activationBehaviorOverride: "double-click",
          themeOverride: {
            textDark: blueCellText,
            ...(nestedCellTheme ?? {}),
          },
        }
      }

      if (cellSchema.type === "boolean") {
        return {
          kind: GridCellKind.Boolean,
          data: typeof cellValue === "boolean" ? cellValue : false,
          allowOverlay: false,
          readonly: readOnly,
        }
      }

      if (cellSchema.type === "number" || cellSchema.type === "integer") {
        return {
          kind: GridCellKind.Number,
          data: typeof cellValue === "number" ? cellValue : undefined,
          displayData: typeof cellValue === "number" ? String(cellValue) : "",
          allowOverlay: true,
          readonly: false,
        }
      }

      return {
        kind: GridCellKind.Text,
        data:
          cellValue === null ||
          isJsonObject(cellValue) ||
          isJsonArray(cellValue)
            ? ""
            : String(cellValue),
        displayData:
          cellValue === null ||
          isJsonObject(cellValue) ||
          isJsonArray(cellValue)
            ? ""
            : String(cellValue),
        allowOverlay: true,
        readonly: false,
      }
    },
    [
      activeNestedView,
      blueCellText,
      columns,
      isMirroredNestedTarget,
      itemSchema,
      mirroredCellBackground,
      readOnly,
      rows,
      selectedCellBackground,
    ]
  )

  const updateCellValue = React.useCallback(
    ([col, row]: Item, nextCell: EditableGridCell) => {
      if (readOnly || !onChange) return

      const column = columns[col]
      const columnId = String(column?.id ?? "value")
      const rowValue = rows[row] ?? null
      const cellSchema = getCellSchemaForArrayColumn(itemSchema, columnId)
      const nextValue = applyPrimitiveEdit(cellSchema, nextCell)

      if (nextValue === undefined) return

      const nextRowValue =
        itemSchema.type === "object"
          ? setObjectValue(rowValue, columnId, nextValue)
          : nextValue

      onChange(setArrayItemValue(value, row, nextRowValue))
    },
    [columns, itemSchema, onChange, readOnly, rows, value]
  )
  const provideEditor = React.useCallback<
    NonNullable<React.ComponentProps<typeof DataEditor>["provideEditor"]>
  >(
    (cell) => {
      if (
        cell.kind !== GridCellKind.Text &&
        cell.kind !== GridCellKind.Number
      ) {
        return undefined
      }

      return {
        editor: (props) => {
          if (
            props.value.kind !== GridCellKind.Text &&
            props.value.kind !== GridCellKind.Number
          ) {
            return null
          }

          return (
            <HumanReviewTextOverlayEditor
              {...(props as React.ComponentProps<
                ProvideEditorComponent<HumanReviewOverlayCell>
              >)}
              overlayOpenRef={fastTextOverlayOpenRef}
              readOnly={readOnly}
            />
          )
        },
      }
    },
    [readOnly]
  )
  const handleOutsideClick = React.useCallback(
    () => !fastTextOverlayOpenRef.current,
    []
  )
  const handleItemHovered = React.useCallback(
    (args: GridMouseEventArgs) => {
      if (!onLocationHover || !resolveLocation || !metadataPath) return

      if (args.kind !== "cell") {
        onLocationHover(undefined)
        return
      }

      const [col, row] = args.location
      const column = columns[col]
      const rowValue = rows[row]
      if (!column || rowValue === undefined) {
        onLocationHover(undefined)
        return
      }

      const columnId = String(column.id ?? "value")
      const rowMetadataPath = resolveArrayItemMetadataPath
        ? resolveArrayItemMetadataPath(metadataPath, row, rowValue)
        : `${metadataPath}[${row}]`
      if (!rowMetadataPath) {
        onLocationHover(undefined)
        return
      }

      const propertyMetadataPath =
        itemSchema.type === "object"
          ? `${rowMetadataPath}.${columnId}`
          : rowMetadataPath

      onLocationHover(
        resolveLocation(propertyMetadataPath) ??
          resolveLocation(rowMetadataPath)
      )
    },
    [
      columns,
      itemSchema.type,
      metadataPath,
      onLocationHover,
      resolveArrayItemMetadataPath,
      resolveLocation,
      rows,
    ]
  )

  const openNestedCell = React.useCallback(
    ([col, row]: Item) => {
      const column = columns[col]
      const columnId = String(column?.id ?? "value")
      const rowValue = rows[row] ?? null
      const cellSchema = getCellSchemaForArrayColumn(itemSchema, columnId)

      if (!isComplexSchema(cellSchema)) return

      setNestedStack((current) => {
        const nextView = {
          rowIndex: row,
          columnId,
          title: `${column?.title ?? columnId} / row ${row + 1}`,
          schema: cellSchema,
          value: getCellValueForArrayColumn(rowValue, itemSchema, columnId),
        }
        const currentView = current[nestedStackBaseDepth]

        if (
          currentView?.rowIndex === nextView.rowIndex &&
          currentView.columnId === nextView.columnId
        ) {
          return current
        }

        return [...current.slice(0, nestedStackBaseDepth), nextView]
      })
    },
    [columns, itemSchema, nestedStackBaseDepth, rows, setNestedStack]
  )

  const updateNestedValue = React.useCallback(
    (nextNestedValue: JsonValue) => {
      if (!activeNestedView || readOnly || !onChange) return

      onChange(
        setNestedArrayValue({
          value,
          schema,
          nestedStack: visibleNestedStack.slice(0, 1),
          nextNestedValue,
        })
      )
      setNestedStack((current) =>
        current.map((view, index) =>
          index === nestedStackBaseDepth
            ? { ...view, value: nextNestedValue }
            : view
        )
      )
    },
    [
      activeNestedView,
      nestedStackBaseDepth,
      onChange,
      readOnly,
      schema,
      setNestedStack,
      value,
      visibleNestedStack,
    ]
  )

  return (
    <div
      onMouseLeave={() => onLocationHover?.(undefined)}
      className={cn(
        "relative overflow-hidden rounded-md border bg-background transition-[border-color,background-color,box-shadow] focus-within:border-blue-500/50 focus-within:shadow-[0_0_0_1px_rgb(59_130_246_/_8%)] hover:border-blue-500/50",
        isActiveNestedSource &&
          "border-blue-500/60 bg-blue-500/5 shadow-[0_0_0_1px_rgb(59_130_246_/_10%)]"
      )}
    >
      <div>
        <div className="flex h-8 items-center justify-between gap-2 border-b px-2 text-[11px] font-medium text-muted-foreground">
          <span>{label}</span>
          <span>{rows.length} rows</span>
        </div>
        <div className="h-[220px]">
          <DataEditor
            columns={columns}
            rows={rows.length}
            getCellContent={getCellContent}
            cellActivationBehavior="double-click"
            gridSelection={localGridSelection}
            highlightRegions={mirroredHighlightRegions}
            onCellEdited={updateCellValue}
            onCellActivated={openNestedCell}
            onGridSelectionChange={handleGridSelectionChange}
            onItemHovered={handleItemHovered}
            provideEditor={provideEditor}
            isOutsideClick={handleOutsideClick}
            rowMarkers="number"
            smoothScrollX
            smoothScrollY
            theme={gridTheme}
            width="100%"
            height="100%"
            rowHeight={32}
            headerHeight={34}
          />
        </div>
      </div>
      {activeNestedView ? (
        <div className="absolute inset-0 z-10 flex flex-col bg-background">
          <div className="flex h-8 items-center gap-2 border-b px-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 text-muted-foreground"
              onClick={() =>
                setNestedStack((current) =>
                  current.slice(
                    0,
                    Math.max(nestedStackBaseDepth, current.length - 1)
                  )
                )
              }
              aria-label="Back to parent array"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
            </Button>
            <div className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
              {activeNestedView.title}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-2">
            {activeNestedView.schema.type === "array" ? (
              <HumanReviewArrayValueGrid
                label={
                  activeNestedView.schema.title ?? activeNestedView.columnId
                }
                nestedStackBaseDepth={nestedStackBaseDepth + 1}
                readOnly={readOnly}
                schema={activeNestedView.schema}
                sharedGridSelection={sharedGridSelection}
                sharedNestedStack={sharedNestedStack}
                value={activeNestedValue}
                viewSide={viewSide}
                activeNestedSide={activeNestedSide}
                activeSelectionSide={activeSelectionSide}
                selectionDepth={selectionDepth}
                onChange={updateNestedValue}
                onGridSelectionChange={onGridSelectionChange}
                onNestedStackChange={onNestedStackChange}
                resolveArrayItemMetadataPath={resolveArrayItemMetadataPath}
                resolveLocation={resolveLocation}
              />
            ) : (
              <HumanReviewObjectValueEditor
                schema={activeNestedView.schema}
                value={activeNestedValue}
                originalValue={activeNestedValue}
                readOnly={readOnly}
                onChange={updateNestedValue}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function HumanReviewObjectValueEditor({
  schema,
  value,
  originalValue,
  readOnly = false,
  onChange,
}: {
  schema: ReviewFieldSchema
  value: JsonValue
  originalValue: JsonValue
  readOnly?: boolean
  onChange: (value: JsonValue) => void
}) {
  const propertyEntries = Object.entries(schema.properties ?? {})

  if (!propertyEntries.length) {
    return (
      <div className="rounded-md bg-background px-2 py-1.5 text-sm text-muted-foreground">
        No properties
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {propertyEntries.map(([propertyKey, propertySchema]) => (
        <HumanReviewFieldCard
          key={propertyKey}
          field={{
            key: propertyKey,
            schema: propertySchema,
            actual: getObjectValue(originalValue, propertyKey),
            expected: getObjectValue(originalValue, propertyKey),
          }}
          value={getObjectValue(value, propertyKey)}
          originalValue={getObjectValue(originalValue, propertyKey)}
          readOnly={readOnly}
          onChange={(childValue) =>
            !readOnly &&
            onChange(setObjectValue(value, propertyKey, childValue))
          }
          onUndo={() =>
            !readOnly &&
            onChange(
              setObjectValue(
                value,
                propertyKey,
                getObjectValue(originalValue, propertyKey)
              )
            )
          }
          onSetNull={() =>
            !readOnly && onChange(setObjectValue(value, propertyKey, null))
          }
        />
      ))}
    </div>
  )
}

type HumanReviewFieldCardProps = {
  field: ReviewField
  value: JsonValue
  originalValue: JsonValue
  active?: boolean
  activeFieldKey?: string
  readOnly?: boolean
  showExpected?: boolean
  onChange: (value: JsonValue) => void
  onFieldFocus?: (field: ReviewField) => void
  onLocationHover?: (location?: ReviewLocation) => void
  onUndo: () => void
  onSetNull: () => void
  resolveArrayItemMetadataPath?: (
    metadataPath: string,
    rowIndex: number,
    rowValue: JsonValue
  ) => string | undefined
  resolveLocation?: (metadataPath: string) => ReviewLocation | undefined
}

function areHumanReviewFieldCardPropsEqual(
  previous: HumanReviewFieldCardProps,
  next: HumanReviewFieldCardProps
) {
  return (
    previous.field === next.field &&
    Object.is(previous.value, next.value) &&
    Object.is(previous.originalValue, next.originalValue) &&
    previous.active === next.active &&
    previous.activeFieldKey === next.activeFieldKey &&
    previous.readOnly === next.readOnly &&
    previous.showExpected === next.showExpected &&
    previous.onFieldFocus === next.onFieldFocus &&
    previous.onLocationHover === next.onLocationHover &&
    previous.resolveArrayItemMetadataPath ===
      next.resolveArrayItemMetadataPath &&
    previous.resolveLocation === next.resolveLocation
  )
}

const HumanReviewFieldCard = React.memo(
  HumanReviewFieldCardBase,
  areHumanReviewFieldCardPropsEqual
)

function HumanReviewFieldCardBase({
  field,
  value,
  originalValue,
  active,
  activeFieldKey,
  readOnly = false,
  showExpected = true,
  onChange,
  onFieldFocus,
  onLocationHover,
  onUndo,
  onSetNull,
  resolveArrayItemMetadataPath,
  resolveLocation,
}: HumanReviewFieldCardProps) {
  const isExpectedEditable = showExpected && !readOnly
  const modified = showExpected && !jsonValuesEqual(value, originalValue)
  const Icon = getFieldIcon(field.schema.type)
  const propertyEntries = Object.entries(field.schema.properties ?? {})
  const [syncedArrayNestedView, setSyncedArrayNestedView] =
    React.useState<SyncedArrayNestedView>(EMPTY_SYNCED_ARRAY_NESTED_VIEW)
  const [syncedArraySelection, setSyncedArraySelection] =
    React.useState<SyncedArraySelection>(EMPTY_SYNCED_ARRAY_SELECTION)
  const updateSyncedArrayNestedView = React.useCallback(
    (stack: ArrayNestedView[], side: ArrayReviewSide) => {
      const activeSide = stack.length ? side : null

      setSyncedArrayNestedView((current) =>
        current.activeSide === activeSide &&
        areArrayNestedViewsEqual(current.stack, stack)
          ? current
          : {
              activeSide,
              stack,
            }
      )
    },
    []
  )
  const updateSyncedArraySelection = React.useCallback(
    (gridSelection: GridSelection, side: ArrayReviewSide, depth: number) => {
      const activeSide = gridSelection.current ? side : null

      setSyncedArraySelection((current) =>
        current.activeSide === activeSide &&
        current.depth === depth &&
        areGridSelectionsEqual(current.gridSelection, gridSelection)
          ? current
          : {
              activeSide,
              depth,
              gridSelection,
            }
      )
    },
    []
  )
  const focusAndHoverField = React.useCallback(() => {
    onFieldFocus?.(field)
    onLocationHover?.(getReviewFieldLocation(field, resolveLocation))
  }, [field, onFieldFocus, onLocationHover, resolveLocation])

  return (
    <div
      tabIndex={0}
      onFocusCapture={focusAndHoverField}
      onMouseEnter={focusAndHoverField}
      onMouseLeave={() => onLocationHover?.(undefined)}
      className={cn(
        "rounded-lg border bg-background p-3 transition-[border-color,background-color,box-shadow] focus-within:border-blue-500/50 focus-within:bg-blue-500/5 hover:border-blue-500/50 hover:bg-blue-500/5 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:outline-none",
        active &&
          "border-blue-500/60 bg-blue-500/5 shadow-[0_0_0_1px_rgb(59_130_246_/_8%)]"
      )}
    >
      <div className="mb-3 flex min-h-8 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {field.schema.title ?? field.key}
              </div>
            </div>
            <span
              className={cn(
                "size-2 shrink-0 rounded-full bg-amber-400",
                !modified && "opacity-0"
              )}
            />
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {field.key}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isExpectedEditable && modified ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={onUndo}
                  aria-label={`Undo ${field.key}`}
                >
                  <HugeiconsIcon icon={Undo02Icon} className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Revert changes</TooltipContent>
            </Tooltip>
          ) : null}
          {isExpectedEditable ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={onSetNull}
                  aria-label={`Set ${field.key} to null`}
                >
                  <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Set to NULL</TooltipContent>
            </Tooltip>
          ) : null}
          <div className="flex h-6 items-center gap-1 rounded-md border bg-muted/50 px-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Icon} className="size-3.5" />
            {field.schema.type}
          </div>
        </div>
      </div>
      {field.schema.type === "object" ? (
        <div className="rounded-md border bg-muted/25 p-2">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-medium text-muted-foreground">
            <span>Properties</span>
            <span>{propertyEntries.length} fields</span>
          </div>
          <div className="space-y-2">
            {propertyEntries.length ? (
              propertyEntries.map(([propertyKey, schema]) => {
                const childField: ReviewField = {
                  key: `${field.key}.${propertyKey}`,
                  schema,
                  actual: getObjectValue(field.actual, propertyKey),
                  expected: getObjectValue(originalValue, propertyKey),
                  metadataPath: `${field.metadataPath ?? field.key}.${propertyKey}`,
                }

                return (
                  <HumanReviewFieldCard
                    key={childField.key}
                    field={childField}
                    value={getObjectValue(value, propertyKey)}
                    originalValue={childField.expected}
                    active={childField.key === activeFieldKey}
                    activeFieldKey={activeFieldKey}
                    readOnly={readOnly}
                    showExpected={showExpected}
                    onChange={(childValue) =>
                      onChange(setObjectValue(value, propertyKey, childValue))
                    }
                    onFieldFocus={onFieldFocus}
                    onLocationHover={onLocationHover}
                    onUndo={() =>
                      onChange(
                        setObjectValue(value, propertyKey, childField.expected)
                      )
                    }
                    onSetNull={() =>
                      onChange(setObjectValue(value, propertyKey, null))
                    }
                    resolveArrayItemMetadataPath={resolveArrayItemMetadataPath}
                    resolveLocation={resolveLocation}
                  />
                )
              })
            ) : (
              <div className="rounded-md bg-background px-2 py-1.5 text-sm text-muted-foreground">
                No properties
              </div>
            )}
          </div>
        </div>
      ) : field.schema.type === "array" ? (
        <div className="grid gap-2">
          <HumanReviewArrayValueGrid
            activeNestedSide={syncedArrayNestedView.activeSide}
            activeSelectionSide={syncedArraySelection.activeSide}
            label="Actual"
            metadataPath={field.metadataPath ?? field.key}
            readOnly
            resolveArrayItemMetadataPath={resolveArrayItemMetadataPath}
            resolveLocation={resolveLocation}
            schema={field.schema}
            selectionDepth={syncedArraySelection.depth}
            sharedGridSelection={syncedArraySelection.gridSelection}
            sharedNestedStack={syncedArrayNestedView.stack}
            value={field.actual}
            viewSide="actual"
            onGridSelectionChange={updateSyncedArraySelection}
            onLocationHover={onLocationHover}
            onNestedStackChange={updateSyncedArrayNestedView}
          />
          {showExpected ? (
            <HumanReviewArrayValueGrid
              activeNestedSide={syncedArrayNestedView.activeSide}
              activeSelectionSide={syncedArraySelection.activeSide}
              label="Expected"
              metadataPath={field.metadataPath ?? field.key}
              readOnly={readOnly}
              resolveArrayItemMetadataPath={resolveArrayItemMetadataPath}
              resolveLocation={resolveLocation}
              schema={field.schema}
              selectionDepth={syncedArraySelection.depth}
              sharedGridSelection={syncedArraySelection.gridSelection}
              sharedNestedStack={syncedArrayNestedView.stack}
              value={value}
              viewSide="expected"
              onChange={onChange}
              onGridSelectionChange={updateSyncedArraySelection}
              onLocationHover={onLocationHover}
              onNestedStackChange={updateSyncedArrayNestedView}
            />
          ) : null}
        </div>
      ) : (
        <div className={cn("grid gap-2", showExpected && "sm:grid-cols-2")}>
          <div className="rounded-md border bg-muted/30 p-2">
            {field.schema.description ? (
              <p className="mb-2 text-xs text-muted-foreground">
                {field.schema.description}
              </p>
            ) : null}
            <div className="mb-1 text-[11px] font-medium text-muted-foreground">
              Actual
            </div>
            <div className="min-h-7 rounded-md bg-background px-2 py-1.5 text-sm">
              {formatValue(field.actual)}
            </div>
          </div>
          {showExpected ? (
            <div className="rounded-md border bg-muted/30 p-2">
              <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                Expected
              </div>
              <HumanReviewValueInput
                readOnly={readOnly}
                schema={field.schema}
                value={getPrimitiveValue(value)}
                onChange={onChange}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export function HumanReviewHighlight({
  location,
}: {
  location: ReviewLocation
}) {
  const area = location.area

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-10 border",
        REVIEW_HIGHLIGHT_STYLE
      )}
      style={{
        left: `${area.left}%`,
        top: `${area.top}%`,
        width: `${area.width}%`,
        height: `${area.height}%`,
      }}
    />
  )
}

export function JsonDiffView({
  actual,
  expected,
  theme = "light",
}: {
  actual: JsonObject
  expected: JsonObject
  theme?: HumanReviewTheme
}) {
  const oldFile = React.useMemo(
    () => ({
      name: "actual.json",
      contents: formatJson(actual),
      lang: "json",
    }),
    [actual]
  )
  const newFile = React.useMemo(
    () => ({
      name: "expected.json",
      contents: formatJson(expected),
      lang: "json",
    }),
    [expected]
  )

  return (
    <ScrollAreaVirtualizer
      className="h-full bg-surface/60"
      contentClassName="min-w-full"
    >
      <div className="bounding-box-citations-diff h-full text-xs">
        <MultiFileDiff
          className="block min-w-full"
          oldFile={oldFile}
          newFile={newFile}
          options={{
            diffStyle: "split",
            disableFileHeader: true,
            diffIndicators: "bars",
            hunkSeparators: "line-info-basic",
            overflow: "wrap",
            themeType: theme,
            theme: {
              light: "pierre-light-soft",
              dark: "pierre-dark-soft",
            },
          }}
        />
      </div>
    </ScrollAreaVirtualizer>
  )
}

export function JsonCodeView({
  name = "actual.json",
  theme = "light",
  value,
}: {
  name?: string
  theme?: HumanReviewTheme
  value: JsonValue
}) {
  const file = React.useMemo(() => {
    const contents = formatJson(value)

    return {
      name,
      contents,
      lang: "json" as const,
      cacheKey: contents,
    }
  }, [name, value])

  return (
    <div
      data-rehype-pretty-code-figure
      className="relative m-0! h-full overflow-hidden rounded-none! bg-code text-code-foreground"
    >
      <WorkerPoolContextProvider
        poolOptions={CODE_WORKER_POOL_OPTIONS}
        highlighterOptions={CODE_HIGHLIGHTER_OPTIONS}
      >
        <ScrollAreaVirtualizer
          key={`${file.cacheKey}:${theme}`}
          className="h-full min-w-0"
          contentClassName="min-w-full"
        >
          <File
            key={`${file.cacheKey}:${theme}`}
            className="block min-w-full"
            file={file}
            metrics={CODE_VIRTUAL_FILE_METRICS}
            style={CODE_FILE_THEME}
            options={{
              disableFileHeader: true,
              overflow: "scroll",
              themeType: theme,
              theme: {
                light: "pierre-light-soft",
                dark: "pierre-dark-soft",
              },
            }}
          />
        </ScrollAreaVirtualizer>
      </WorkerPoolContextProvider>
    </div>
  )
}

export function HumanReviewPanel({
  fields = REVIEW_FIELDS,
  activeFieldKey,
  className,
  onFieldFocus,
  onLocationHover,
  resolveArrayItemMetadataPath,
  resolveLocation,
  showExpected = true,
  theme = "light",
}: {
  fields?: ReviewField[]
  activeFieldKey?: string
  className?: string
  onFieldFocus?: (field: ReviewField) => void
  onLocationHover?: (location?: ReviewLocation) => void
  resolveArrayItemMetadataPath?: (
    metadataPath: string,
    rowIndex: number,
    rowValue: JsonValue
  ) => string | undefined
  resolveLocation?: (metadataPath: string) => ReviewLocation | undefined
  showExpected?: boolean
  theme?: HumanReviewTheme
} = {}) {
  const [activeTab, setActiveTab] = React.useState("form")
  const actualValues = React.useMemo(
    () => valuesFromFields(fields, "actual"),
    [fields]
  )
  const initialExpectedValues = React.useMemo(
    () => valuesFromFields(fields, "expected"),
    [fields]
  )
  const [expected, setExpected] = React.useState<JsonObject>(
    initialExpectedValues
  )

  React.useEffect(() => {
    setExpected(initialExpectedValues)
  }, [initialExpectedValues])

  const updateValue = React.useCallback((key: string, value: JsonValue) => {
    setExpected((current) =>
      Object.is(current[key], value) ? current : { ...current, [key]: value }
    )
  }, [])

  return (
    <TooltipProvider delay={200}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className={cn("flex h-[560px] flex-col gap-0 bg-background", className)}
      >
        <div className="flex min-h-12 items-center justify-between gap-3 border-b px-3">
          <TabsList className="h-8 sm:h-7">
            <TabsTrigger value="form" className="h-7 sm:h-6">
              <HugeiconsIcon icon={TextCheckIcon} className="size-4" />
              Form
            </TabsTrigger>
            <TabsTrigger value="json" className="h-7 sm:h-6">
              <HugeiconsIcon icon={SourceCodeSquareIcon} className="size-4" />
              JSON
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="form" keepMounted className="min-h-0 flex-1">
          <ScrollArea className="h-full" scrollFade>
            <div className="space-y-3 p-3">
              {fields.map((field) => (
                <HumanReviewFieldCard
                  key={field.key}
                  field={field}
                  value={
                    showExpected ? (expected[field.key] ?? null) : field.actual
                  }
                  originalValue={showExpected ? field.expected : field.actual}
                  active={
                    field.key === activeFieldKey ||
                    activeFieldKey?.startsWith(`${field.key}.`)
                  }
                  activeFieldKey={activeFieldKey}
                  showExpected={showExpected}
                  onChange={(value) => updateValue(field.key, value)}
                  onFieldFocus={onFieldFocus}
                  onLocationHover={onLocationHover}
                  onUndo={() => updateValue(field.key, field.expected)}
                  onSetNull={() => updateValue(field.key, null)}
                  resolveArrayItemMetadataPath={resolveArrayItemMetadataPath}
                  resolveLocation={resolveLocation}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="json" keepMounted className="min-h-0 flex-1">
          {showExpected ? (
            <JsonDiffView
              actual={actualValues}
              expected={expected}
              theme={theme}
            />
          ) : (
            <JsonCodeView value={actualValues} theme={theme} />
          )}
        </TabsContent>
      </Tabs>
    </TooltipProvider>
  )
}
