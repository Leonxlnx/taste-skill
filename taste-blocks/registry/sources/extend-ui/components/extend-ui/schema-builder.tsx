"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Add01Icon,
  CancelCircleIcon,
  ChevronDown,
  DragDropVerticalIcon,
  InputNumericIcon,
  InputTextIcon,
  LeftToRightListBulletIcon,
  SecondBracketIcon,
  SourceCodeSquareIcon,
  TableIcon,
  TextCheckIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Virtualizer as DiffsVirtualizer } from "@pierre/diffs"
import {
  File,
  VirtualizerContext,
  WorkerPoolContextProvider,
  type VirtualFileMetrics,
  type WorkerInitializationRenderOptions,
  type WorkerPoolOptions,
} from "@pierre/diffs/react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type SchemaBuilderScalarType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "null"
export type SchemaBuilderFieldType =
  | SchemaBuilderScalarType
  | "object"
  | "array"
  | "enum"
export type SchemaBuilderArrayScalarType = Exclude<
  SchemaBuilderScalarType,
  "null"
>
export type SchemaBuilderArrayItemType =
  | SchemaBuilderArrayScalarType
  | "object"
  | "enum"

export type SchemaBuilderEnumValue = {
  id: string
  value: string
  description: string
}

export type SchemaBuilderProperty = {
  id: string
  key: string
  type: SchemaBuilderFieldType
  description: string
  enumValues?: SchemaBuilderEnumValue[]
  properties?: SchemaBuilderProperty[]
  items?: {
    type: SchemaBuilderArrayItemType
    properties?: SchemaBuilderProperty[]
    enumValues?: SchemaBuilderEnumValue[]
  }
}

export type SchemaBuilderSchema = {
  properties: SchemaBuilderProperty[]
}

export type SchemaBuilderTheme = "light" | "dark"

export type SerializedSchemaProperty = {
  type: string
  description?: string
  enum?: string[]
  enumDescriptions?: Record<string, string>
  properties?: Record<string, SerializedSchemaProperty>
  items?: SerializedSchemaProperty
}

export type SerializedSchema = {
  type: "object"
  properties: Record<string, SerializedSchemaProperty>
}

const SCALAR_TYPES: SchemaBuilderScalarType[] = [
  "string",
  "number",
  "integer",
  "boolean",
  "null",
]
const ARRAY_SCALAR_TYPES: SchemaBuilderArrayScalarType[] = [
  "string",
  "number",
  "integer",
  "boolean",
]
const ROOT_SCHEMA_CONTAINER_ID = "schema-root"
const SCHEMA_PROPERTY_DRAG_TYPE = "schema-property"
const ENUM_VALUE_DRAG_TYPE = "enum-value"
const SCHEMA_PROPERTY_BLOCK_ATTRIBUTE = "data-schema-builder-property-id"
const SCHEMA_PROPERTY_ROW_ATTRIBUTE = "data-schema-builder-property-row-id"
const PROPERTY_REORDER_EDGE_THRESHOLD_PX = 18
const SCHEMA_DND_MEASURING = {
  droppable: {
    strategy: MeasuringStrategy.WhileDragging,
  },
}
type SchemaCollisionArgs = Parameters<CollisionDetection>[0]

function getDroppableRectArea(
  droppableRects: SchemaCollisionArgs["droppableRects"],
  id: UniqueIdentifier
) {
  const rect = droppableRects.get(id)
  return rect ? rect.width * rect.height : Number.POSITIVE_INFINITY
}

function getProjectedPropertyChildContainerId(
  properties: SchemaBuilderProperty[],
  propertyId: UniqueIdentifier,
  args: SchemaCollisionArgs
) {
  const overLocation = findPropertyLocation(properties, String(propertyId))
  const childContainerId = overLocation
    ? getPropertyChildContainerId(overLocation.property)
    : null
  const overRect = args.droppableRects.get(propertyId)

  if (
    childContainerId &&
    args.pointerCoordinates &&
    overRect &&
    args.pointerCoordinates.x > overRect.left + overRect.width * 0.18
  ) {
    return childContainerId
  }

  return null
}

function getSchemaPropertyElementRect(attribute: string, id: UniqueIdentifier) {
  if (typeof document === "undefined") return null

  for (const element of document.querySelectorAll<HTMLElement>(
    `[${attribute}]`
  )) {
    if (element.getAttribute(attribute) === String(id)) {
      return element.getBoundingClientRect()
    }
  }

  return null
}

function getPropertyBlockRect(id: UniqueIdentifier, args: SchemaCollisionArgs) {
  return (
    getSchemaPropertyElementRect(SCHEMA_PROPERTY_BLOCK_ATTRIBUTE, id) ??
    args.droppableRects.get(id) ??
    null
  )
}

function getPropertyRowRect(id: UniqueIdentifier) {
  return getSchemaPropertyElementRect(SCHEMA_PROPERTY_ROW_ATTRIBUTE, id)
}

const TYPE_LABELS: Record<
  SchemaBuilderFieldType | `array-${SchemaBuilderArrayItemType}`,
  string
> = {
  string: "String",
  number: "Number",
  integer: "Integer",
  boolean: "Boolean",
  null: "Null",
  object: "Object",
  array: "Array",
  enum: "Enum",
  "array-string": "Array<string>",
  "array-number": "Array<number>",
  "array-integer": "Array<integer>",
  "array-boolean": "Array<boolean>",
  "array-enum": "Array<enum>",
  "array-object": "Array<object>",
}

type SchemaBuilderTypeStyleKey =
  | SchemaBuilderFieldType
  | `array-${SchemaBuilderArrayItemType}`

const TYPE_STYLES: Record<
  SchemaBuilderTypeStyleKey,
  {
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
    badge: string
  }
> = {
  string: {
    icon: InputTextIcon,
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-300/10 dark:text-blue-300",
  },
  number: {
    icon: InputNumericIcon,
    badge:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-300/10 dark:text-emerald-300",
  },
  integer: {
    icon: InputNumericIcon,
    badge: "bg-teal-50 text-teal-600 dark:bg-teal-300/10 dark:text-teal-300",
  },
  boolean: {
    icon: TextCheckIcon,
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-300/10 dark:text-amber-300",
  },
  null: {
    icon: CancelCircleIcon,
    badge: "bg-zinc-50 text-zinc-600 dark:bg-zinc-300/10 dark:text-zinc-300",
  },
  object: {
    icon: SourceCodeSquareIcon,
    badge:
      "bg-violet-50 text-violet-600 dark:bg-violet-300/10 dark:text-violet-300",
  },
  array: {
    icon: SecondBracketIcon,
    badge: "bg-cyan-50 text-cyan-600 dark:bg-cyan-300/10 dark:text-cyan-300",
  },
  enum: {
    icon: LeftToRightListBulletIcon,
    badge: "bg-rose-50 text-rose-600 dark:bg-rose-300/10 dark:text-rose-300",
  },
  "array-string": {
    icon: SecondBracketIcon,
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-300/10 dark:text-blue-300",
  },
  "array-number": {
    icon: SecondBracketIcon,
    badge:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-300/10 dark:text-emerald-300",
  },
  "array-integer": {
    icon: SecondBracketIcon,
    badge: "bg-teal-50 text-teal-600 dark:bg-teal-300/10 dark:text-teal-300",
  },
  "array-boolean": {
    icon: SecondBracketIcon,
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-300/10 dark:text-amber-300",
  },
  "array-enum": {
    icon: LeftToRightListBulletIcon,
    badge: "bg-rose-50 text-rose-600 dark:bg-rose-300/10 dark:text-rose-300",
  },
  "array-object": {
    icon: SecondBracketIcon,
    badge:
      "bg-violet-50 text-violet-600 dark:bg-violet-300/10 dark:text-violet-300",
  },
}

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

function useResolvedCodeThemeType(theme?: SchemaBuilderTheme) {
  const { resolvedTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (theme) return theme

  return isMounted && resolvedTheme === "dark" ? "dark" : "light"
}

export const SAMPLE_SCHEMA: SchemaBuilderSchema = {
  properties: [
    {
      id: "statement-period",
      key: "statement_period",
      type: "string",
      description: "Date range covered by the bank statement.",
    },
    {
      id: "account-type",
      key: "account_type",
      type: "enum",
      description: "Account product shown on the statement.",
      enumValues: [
        {
          id: "account-type-checking",
          value: "checking",
          description: "Standard checking account.",
        },
        {
          id: "account-type-savings",
          value: "savings",
          description: "Savings or money market account.",
        },
      ],
    },
    {
      id: "account-holder",
      key: "account_holder",
      type: "object",
      description: "Person or business that owns the account.",
      properties: [
        {
          id: "holder-name",
          key: "name",
          type: "string",
          description: "Full account holder name.",
        },
        {
          id: "holder-address",
          key: "address",
          type: "object",
          description: "Mailing address for the account holder.",
          properties: [
            {
              id: "holder-address-line-1",
              key: "line_1",
              type: "string",
              description: "Street address line.",
            },
            {
              id: "holder-address-city",
              key: "city",
              type: "string",
              description: "City from the mailing address.",
            },
          ],
        },
      ],
    },
    {
      id: "transactions",
      key: "transactions",
      type: "array",
      description: "Posted account activity during the statement period.",
      items: {
        type: "object",
        properties: [
          {
            id: "transaction-date",
            key: "date",
            type: "string",
            description: "Posting date for the transaction.",
          },
          {
            id: "transaction-description",
            key: "description",
            type: "string",
            description: "Statement transaction description.",
          },
          {
            id: "transaction-amount",
            key: "amount",
            type: "number",
            description: "Signed transaction amount.",
          },
        ],
      },
    },
  ],
}

let nextPropertyId = 0

function createId(prefix: string) {
  nextPropertyId += 1
  return `${prefix}-${nextPropertyId}`
}

function createEnumValue(): SchemaBuilderEnumValue {
  return {
    id: createId("enum"),
    value: "",
    description: "",
  }
}

function createProperty(
  type: SchemaBuilderFieldType = "string"
): SchemaBuilderProperty {
  return normalizePropertyForType({
    id: createId("property"),
    key: "",
    type,
    description: "",
  })
}

function normalizePropertyForType(
  property: SchemaBuilderProperty,
  type = property.type
): SchemaBuilderProperty {
  const base = {
    ...property,
    type,
  }

  if (type === "enum") {
    return {
      ...base,
      enumValues: base.enumValues?.length
        ? base.enumValues
        : [createEnumValue()],
      properties: undefined,
      items: undefined,
    }
  }

  if (type === "object") {
    return {
      ...base,
      enumValues: undefined,
      properties: base.properties?.length
        ? base.properties
        : [createProperty("string")],
      items: undefined,
    }
  }

  if (type === "array") {
    return {
      ...base,
      enumValues: undefined,
      properties: undefined,
      items: base.items ?? {
        type: "object",
        properties: [createProperty("string")],
      },
    }
  }

  return {
    ...base,
    enumValues: undefined,
    properties: undefined,
    items: undefined,
  }
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function serializeProperty(
  property: SchemaBuilderProperty
): SerializedSchemaProperty {
  const description = property.description.trim()
  const base = description ? { description } : {}

  if (property.type === "enum") {
    const enumValues = property.enumValues ?? []
    return {
      type: "string",
      ...base,
      enum: enumValues.map((option) => option.value),
      enumDescriptions: Object.fromEntries(
        enumValues
          .filter((option) => option.description.trim())
          .map((option) => [option.value, option.description])
      ),
    }
  }

  if (property.type === "object") {
    return {
      type: "object",
      ...base,
      properties: serializeProperties(property.properties ?? []),
    }
  }

  if (property.type === "array") {
    const items = property.items ?? { type: "string" as const }

    return {
      type: "array",
      ...base,
      items:
        items.type === "object"
          ? {
              type: "object",
              properties: serializeProperties(items.properties ?? []),
            }
          : items.type === "enum"
            ? {
                type: "string",
                enum: (items.enumValues ?? []).map((option) => option.value),
                enumDescriptions: Object.fromEntries(
                  (items.enumValues ?? [])
                    .filter((option) => option.description.trim())
                    .map((option) => [option.value, option.description])
                ),
              }
            : { type: items.type },
    }
  }

  return {
    type: property.type,
    ...base,
  }
}

function serializeProperties(
  properties: SchemaBuilderProperty[]
): Record<string, SerializedSchemaProperty> {
  return Object.fromEntries(
    properties
      .filter((property) => property.key.trim())
      .map((property) => [property.key.trim(), serializeProperty(property)])
  )
}

export function serializeSchema(schema: SchemaBuilderSchema): SerializedSchema {
  return {
    type: "object",
    properties: serializeProperties(schema.properties),
  }
}

function updatePropertyById(
  properties: SchemaBuilderProperty[],
  id: string,
  update: (property: SchemaBuilderProperty) => SchemaBuilderProperty
) {
  return properties.map((property) =>
    property.id === id ? update(property) : property
  )
}

function getObjectContainerId(propertyId: string) {
  return `object:${propertyId}`
}

function getArrayObjectContainerId(propertyId: string) {
  return `array-object:${propertyId}`
}

function isPropertyContainerId(id: UniqueIdentifier) {
  const value = String(id)

  return (
    value === ROOT_SCHEMA_CONTAINER_ID ||
    value.startsWith("object:") ||
    value.startsWith("array-object:")
  )
}

function getPropertyChildContainerId(property: SchemaBuilderProperty) {
  if (property.type === "object") {
    return getObjectContainerId(property.id)
  }

  if (property.type === "array" && property.items?.type === "object") {
    return getArrayObjectContainerId(property.id)
  }

  return null
}

function propertyHasNestedEditor(property: SchemaBuilderProperty) {
  return (
    property.type === "enum" ||
    property.type === "object" ||
    property.type === "array"
  )
}

function getNestedEditorLabel(property: SchemaBuilderProperty) {
  return `${
    property.type === "enum" ? "Configure enums" : "Configure schema"
  } for ${property.key || "property"}`
}

type PropertyLocation = {
  containerId: string
  index: number
  property: SchemaBuilderProperty
}

const NOT_FOUND_PROPERTIES: SchemaBuilderProperty[] = []

function findPropertyLocation(
  properties: SchemaBuilderProperty[],
  propertyId: string,
  containerId = ROOT_SCHEMA_CONTAINER_ID
): PropertyLocation | null {
  for (let index = 0; index < properties.length; index += 1) {
    const property = properties[index]
    if (!property) continue

    if (property.id === propertyId) {
      return {
        containerId,
        index,
        property,
      }
    }

    if (property.type === "object") {
      const nestedLocation = findPropertyLocation(
        property.properties ?? [],
        propertyId,
        getObjectContainerId(property.id)
      )
      if (nestedLocation) return nestedLocation
    }

    if (property.type === "array" && property.items?.type === "object") {
      const nestedLocation = findPropertyLocation(
        property.items.properties ?? [],
        propertyId,
        getArrayObjectContainerId(property.id)
      )
      if (nestedLocation) return nestedLocation
    }
  }

  return null
}

function propertyOwnsContainer(
  property: SchemaBuilderProperty,
  containerId: string
): boolean {
  if (property.type === "object") {
    if (getObjectContainerId(property.id) === containerId) return true

    if (
      (property.properties ?? []).some((childProperty) =>
        propertyOwnsContainer(childProperty, containerId)
      )
    ) {
      return true
    }
  }

  if (property.type === "array" && property.items?.type === "object") {
    if (getArrayObjectContainerId(property.id) === containerId) return true

    return (property.items.properties ?? []).some((childProperty) =>
      propertyOwnsContainer(childProperty, containerId)
    )
  }

  return false
}

function getContainerProperties(
  properties: SchemaBuilderProperty[],
  containerId: string
): SchemaBuilderProperty[] {
  if (containerId === ROOT_SCHEMA_CONTAINER_ID) return properties

  for (const property of properties) {
    if (property.type === "object") {
      if (getObjectContainerId(property.id) === containerId) {
        return property.properties ?? []
      }

      const nestedProperties = getContainerProperties(
        property.properties ?? [],
        containerId
      )
      if (nestedProperties !== NOT_FOUND_PROPERTIES) return nestedProperties
    }

    if (property.type === "array" && property.items?.type === "object") {
      if (getArrayObjectContainerId(property.id) === containerId) {
        return property.items.properties ?? []
      }

      const nestedProperties = getContainerProperties(
        property.items.properties ?? [],
        containerId
      )
      if (nestedProperties !== NOT_FOUND_PROPERTIES) return nestedProperties
    }
  }

  return NOT_FOUND_PROPERTIES
}

function setContainerProperties(
  properties: SchemaBuilderProperty[],
  containerId: string,
  nextContainerProperties: SchemaBuilderProperty[]
): SchemaBuilderProperty[] {
  if (containerId === ROOT_SCHEMA_CONTAINER_ID) return nextContainerProperties

  return properties.map((property) => {
    if (property.type === "object") {
      if (getObjectContainerId(property.id) === containerId) {
        return {
          ...property,
          properties: nextContainerProperties,
        }
      }

      return {
        ...property,
        properties: setContainerProperties(
          property.properties ?? [],
          containerId,
          nextContainerProperties
        ),
      }
    }

    if (property.type === "array" && property.items?.type === "object") {
      if (getArrayObjectContainerId(property.id) === containerId) {
        return {
          ...property,
          items: {
            ...property.items,
            properties: nextContainerProperties,
          },
        }
      }

      return {
        ...property,
        items: {
          ...property.items,
          properties: setContainerProperties(
            property.items.properties ?? [],
            containerId,
            nextContainerProperties
          ),
        },
      }
    }

    return property
  })
}

function moveProperty(
  properties: SchemaBuilderProperty[],
  activeId: string,
  overId: string
) {
  const activeLocation = findPropertyLocation(properties, activeId)
  if (!activeLocation) return properties

  const overLocation = findPropertyLocation(properties, overId)
  const targetContainerId = overLocation?.containerId ?? overId
  if (!isPropertyContainerId(targetContainerId)) return properties

  if (propertyOwnsContainer(activeLocation.property, targetContainerId)) {
    return properties
  }

  if (activeLocation.containerId === targetContainerId) {
    if (!overLocation) return properties

    const containerProperties = getContainerProperties(
      properties,
      activeLocation.containerId
    )
    const targetIndex = overLocation.index

    if (activeLocation.index === targetIndex) return properties

    return setContainerProperties(
      properties,
      activeLocation.containerId,
      arrayMove(containerProperties, activeLocation.index, targetIndex)
    )
  }

  const sourceProperties = getContainerProperties(
    properties,
    activeLocation.containerId
  )
  let nextProperties = setContainerProperties(
    properties,
    activeLocation.containerId,
    sourceProperties.filter((property) => property.id !== activeId)
  )
  const refreshedOverLocation = overLocation
    ? findPropertyLocation(nextProperties, overId)
    : null
  const targetProperties = getContainerProperties(
    nextProperties,
    targetContainerId
  )
  const targetIndex = refreshedOverLocation?.index ?? targetProperties.length
  const nextTargetProperties = targetProperties.slice()

  nextTargetProperties.splice(targetIndex, 0, activeLocation.property)
  nextProperties = setContainerProperties(
    nextProperties,
    targetContainerId,
    nextTargetProperties
  )

  return nextProperties
}

type PropertyMovePreview = {
  containerId: string
  index: number
  property: SchemaBuilderProperty
}

function getPropertyMovePreview(
  properties: SchemaBuilderProperty[],
  activeId: string,
  overId: string
): PropertyMovePreview | null {
  const activeLocation = findPropertyLocation(properties, activeId)
  if (!activeLocation) return null

  const overLocation = findPropertyLocation(properties, overId)
  const targetContainerId = overLocation?.containerId ?? overId
  if (!isPropertyContainerId(targetContainerId)) return null

  if (propertyOwnsContainer(activeLocation.property, targetContainerId)) {
    return null
  }

  if (activeLocation.containerId === targetContainerId) return null

  const targetProperties = getContainerProperties(properties, targetContainerId)

  return {
    containerId: targetContainerId,
    index: overLocation?.index ?? targetProperties.length,
    property: activeLocation.property,
  }
}

function isSameContainerPropertyReorderReady(
  properties: SchemaBuilderProperty[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  args: SchemaCollisionArgs
) {
  const activeLocation = findPropertyLocation(properties, String(activeId))
  const overLocation = findPropertyLocation(properties, String(overId))
  if (!activeLocation || !overLocation) return true
  if (activeLocation.containerId !== overLocation.containerId) return true

  const overRect = getPropertyBlockRect(overId, args)
  if (!overRect || !args.pointerCoordinates) return true

  const threshold = Math.min(
    PROPERTY_REORDER_EDGE_THRESHOLD_PX,
    overRect.height / 2
  )

  if (activeLocation.index < overLocation.index) {
    return args.pointerCoordinates.y >= overRect.bottom - threshold
  }

  if (activeLocation.index > overLocation.index) {
    return args.pointerCoordinates.y <= overRect.top + threshold
  }

  return false
}

function isSchemaCollisionCandidate(
  properties: SchemaBuilderProperty[],
  id: UniqueIdentifier,
  activeId: UniqueIdentifier,
  args: SchemaCollisionArgs
) {
  if (id === activeId) return false

  const value = String(id)
  const isSchemaTarget =
    isPropertyContainerId(value) ||
    Boolean(findPropertyLocation(properties, value))

  return (
    isSchemaTarget &&
    isSameContainerPropertyReorderReady(properties, activeId, id, args)
  )
}

function isPointerBelowLastContainerProperty(
  containerProperties: SchemaBuilderProperty[],
  args: SchemaCollisionArgs
) {
  const lastProperty = containerProperties.at(-1)
  if (!lastProperty || !args.pointerCoordinates) return true

  const lastPropertyRect = getPropertyBlockRect(lastProperty.id, args)
  if (!lastPropertyRect) return false

  return args.pointerCoordinates.y >= lastPropertyRect.bottom
}

function getNextPropertyInsertionId(
  properties: SchemaBuilderProperty[],
  location: PropertyLocation
) {
  const targetProperties = getContainerProperties(
    properties,
    location.containerId
  )

  return targetProperties[location.index + 1]?.id ?? location.containerId
}

function resolveCrossContainerPropertyInsertionId(
  properties: SchemaBuilderProperty[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  args: SchemaCollisionArgs
) {
  const activeLocation = findPropertyLocation(properties, String(activeId))
  const overLocation = findPropertyLocation(properties, String(overId))
  if (!activeLocation || !overLocation || !args.pointerCoordinates) {
    return overId
  }

  if (activeLocation.containerId === overLocation.containerId) {
    return overId
  }

  const overRowRect = getPropertyRowRect(overId)
  if (overRowRect) {
    const overRowMiddle = overRowRect.top + overRowRect.height / 2

    return args.pointerCoordinates.y < overRowMiddle
      ? overId
      : getNextPropertyInsertionId(properties, overLocation)
  }

  const overBlockRect = getPropertyBlockRect(overId, args)
  if (!overBlockRect) return overId

  const overBlockMiddle = overBlockRect.top + overBlockRect.height / 2

  return args.pointerCoordinates.y < overBlockMiddle
    ? overId
    : getNextPropertyInsertionId(properties, overLocation)
}

function useSchemaBuilderSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
}

function useStableCallback<Args extends unknown[], Result>(
  callback: (...args: Args) => Result
) {
  const callbackRef = React.useRef(callback)

  React.useInsertionEffect(() => {
    callbackRef.current = callback
  })

  return React.useCallback((...args: Args) => callbackRef.current(...args), [])
}

function useStableIds(ids: string[]) {
  const idsKey = JSON.stringify(ids)

  return React.useMemo(() => JSON.parse(idsKey) as string[], [idsKey])
}

function getTypeStyleKey(
  property: SchemaBuilderProperty
): SchemaBuilderTypeStyleKey {
  if (property.type === "array" && property.items) {
    return `array-${property.items.type}`
  }

  return property.type
}

function SchemaTypeBadge({
  className,
  type,
}: {
  className?: string
  type: SchemaBuilderTypeStyleKey
}) {
  const style = TYPE_STYLES[type]

  return (
    <span
      className={cn(
        "inline-flex min-w-0 shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        style.badge,
        className
      )}
    >
      <HugeiconsIcon icon={style.icon} className="size-3.5" />
      <span className="truncate">{TYPE_LABELS[type]}</span>
    </span>
  )
}

function SchemaTypeMenuItem({
  type,
  onSelect,
}: {
  type: SchemaBuilderTypeStyleKey
  onSelect: () => void
}) {
  return (
    <DropdownMenuItem onClick={onSelect}>
      <SchemaTypeBadge type={type} />
    </DropdownMenuItem>
  )
}

function SchemaTypeMenu({
  property,
  onChange,
}: {
  property: SchemaBuilderProperty
  onChange: (property: SchemaBuilderProperty) => void
}) {
  const updateType = React.useCallback(
    (type: SchemaBuilderFieldType) => {
      onChange(normalizePropertyForType(property, type))
    },
    [onChange, property]
  )

  const updateArrayItemType = React.useCallback(
    (itemType: SchemaBuilderArrayItemType) => {
      onChange({
        ...normalizePropertyForType(property, "array"),
        items:
          itemType === "object"
            ? {
                type: "object",
                properties: property.items?.properties?.length
                  ? property.items.properties
                  : [createProperty("string")],
              }
            : itemType === "enum"
              ? {
                  type: "enum",
                  enumValues: property.items?.enumValues?.length
                    ? property.items.enumValues
                    : [createEnumValue()],
                }
              : { type: itemType },
      })
    },
    [onChange, property]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-full min-w-0 justify-between overflow-hidden rounded-md px-2"
        >
          <SchemaTypeBadge
            className="max-w-full shrink"
            type={getTypeStyleKey(property)}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>JSON types</DropdownMenuLabel>
          {SCALAR_TYPES.map((type) => (
            <SchemaTypeMenuItem
              key={type}
              type={type}
              onSelect={() => updateType(type)}
            />
          ))}
          <SchemaTypeMenuItem type="enum" onSelect={() => updateType("enum")} />
          <SchemaTypeMenuItem
            type="object"
            onSelect={() => updateType("object")}
          />
        </DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SchemaTypeBadge type="array" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Nested</DropdownMenuLabel>
              <SchemaTypeMenuItem
                type="array-object"
                onSelect={() => updateArrayItemType("object")}
              />
              <SchemaTypeMenuItem
                type="array-enum"
                onSelect={() => updateArrayItemType("enum")}
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Scalars</DropdownMenuLabel>
              {ARRAY_SCALAR_TYPES.map((type) => (
                <SchemaTypeMenuItem
                  key={type}
                  type={`array-${type}`}
                  onSelect={() => updateArrayItemType(type)}
                />
              ))}
            </DropdownMenuGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ArrayItemTypeMenu({
  property,
  onChange,
}: {
  property: SchemaBuilderProperty
  onChange: (property: SchemaBuilderProperty) => void
}) {
  const items = property.items ?? { type: "string" as const }

  const updateItemType = React.useCallback(
    (type: SchemaBuilderArrayItemType) => {
      onChange({
        ...property,
        items:
          type === "object"
            ? {
                type: "object",
                properties: items.properties?.length
                  ? items.properties
                  : [createProperty("string")],
              }
            : type === "enum"
              ? {
                  type: "enum",
                  enumValues: items.enumValues?.length
                    ? items.enumValues
                    : [createEnumValue()],
                }
              : { type },
      })
    },
    [items.enumValues, items.properties, onChange, property]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 px-2"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <SchemaTypeBadge type={`array-${items.type}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Nested</DropdownMenuLabel>
          <SchemaTypeMenuItem
            type="array-object"
            onSelect={() => updateItemType("object")}
          />
          <SchemaTypeMenuItem
            type="array-enum"
            onSelect={() => updateItemType("enum")}
          />
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Scalars</DropdownMenuLabel>
          {ARRAY_SCALAR_TYPES.map((type) => (
            <SchemaTypeMenuItem
              key={type}
              type={`array-${type}`}
              onSelect={() => updateItemType(type)}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function InlineTextInput({
  className,
  onChange,
  onInput,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const handleInput = React.useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      onInput?.(event as Parameters<NonNullable<typeof onInput>>[0])
      onChange?.(event as unknown as React.ChangeEvent<HTMLInputElement>)
    },
    [onChange, onInput]
  )

  return (
    <input
      className={cn(
        "h-9 w-full min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:bg-background",
        className
      )}
      onInput={handleInput}
      {...props}
    />
  )
}

function EnumEditor({
  values,
  onChange,
}: {
  values: SchemaBuilderEnumValue[]
  onChange: (values: SchemaBuilderEnumValue[]) => void
}) {
  const sensors = useSchemaBuilderSensors()
  const dndContextId = React.useId()
  const sortableItems = useStableIds(values.map((value) => value.id))
  const updateValue = useStableCallback(
    (
      id: string,
      update: (value: SchemaBuilderEnumValue) => SchemaBuilderEnumValue
    ) => {
      onChange(values.map((value) => (value.id === id ? update(value) : value)))
    }
  )
  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeIndex = values.findIndex((value) => value.id === active.id)
      const overIndex = values.findIndex((value) => value.id === over.id)

      if (activeIndex < 0 || overIndex < 0) return

      onChange(arrayMove(values, activeIndex, overIndex))
    },
    [onChange, values]
  )

  return (
    <DndContext
      id={`schema-builder-enum-${dndContextId}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-visible rounded-lg border bg-background">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/55 text-xs text-muted-foreground">
              <th className="w-[34%] px-3 py-2 text-start font-medium">Value</th>
              <th className="border-s px-3 py-2 text-start font-medium">
                Description
              </th>
            </tr>
          </thead>
          <SortableContext
            id={`schema-builder-enum-sortable-${dndContextId}`}
            items={sortableItems}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {values.map((value) => (
                <SortableEnumRow
                  key={value.id}
                  value={value}
                  onValueChange={updateValue}
                />
              ))}
              <tr>
                <td colSpan={2} className="p-0">
                  <button
                    type="button"
                    className="flex h-9 w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/55 hover:text-foreground focus-visible:bg-muted/55 focus-visible:text-foreground"
                    onClick={() => onChange([...values, createEnumValue()])}
                  >
                    <HugeiconsIcon icon={Add01Icon} className="size-4" />
                    Add enum value
                  </button>
                </td>
              </tr>
            </tbody>
          </SortableContext>
        </table>
      </div>
    </DndContext>
  )
}

const SortableEnumRow = React.memo(function SortableEnumRow({
  value,
  onValueChange,
}: {
  value: SchemaBuilderEnumValue
  onValueChange: (
    id: string,
    update: (value: SchemaBuilderEnumValue) => SchemaBuilderEnumValue
  ) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: value.id,
    data: {
      type: ENUM_VALUE_DRAG_TYPE,
    },
  })

  return (
    <tr
      ref={setNodeRef}
      className={cn(
        "group/enum-row border-b motion-reduce:!transition-none",
        isDragging && "relative z-10 opacity-70"
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <td className="relative p-0 align-top">
        <button
          type="button"
          className={cn(
            "absolute top-1/2 start-0 z-50 grid size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-md border bg-background text-muted-foreground opacity-0 shadow-sm transition-[opacity,color,box-shadow] outline-none group-hover/enum-row:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing motion-reduce:transition-none rtl:translate-x-1/2",
            isDragging && "opacity-100"
          )}
          aria-label={`Drag enum value ${value.value || "empty value"}`}
          {...attributes}
          {...listeners}
        >
          <HugeiconsIcon icon={DragDropVerticalIcon} className="size-3.5" />
        </button>
        <div className="min-w-0">
          <InlineTextInput
            value={value.value}
            placeholder="approved"
            onChange={(event) =>
              onValueChange(value.id, (current) => ({
                ...current,
                value: event.target.value,
              }))
            }
          />
        </div>
      </td>
      <td className="border-s p-0 align-top">
        <InlineTextInput
          value={value.description}
          placeholder="When the reviewer accepts the extracted value."
          onChange={(event) =>
            onValueChange(value.id, (current) => ({
              ...current,
              description: event.target.value,
            }))
          }
        />
      </td>
    </tr>
  )
})

function ArrayItemsEditor({
  property,
  onChange,
  depth,
  dropPreview,
  nestedEditorOpenByPropertyId,
  onNestedEditorOpenChange,
}: {
  property: SchemaBuilderProperty
  onChange: (property: SchemaBuilderProperty) => void
  depth: number
  dropPreview: PropertyMovePreview | null
  nestedEditorOpenByPropertyId: Record<string, boolean>
  onNestedEditorOpenChange: (propertyId: string, open: boolean) => void
}) {
  const items = property.items ?? { type: "string" as const }

  return (
    <>
      {items.type === "object" ? (
        <SchemaBuilderTable
          properties={items.properties ?? []}
          depth={depth + 1}
          containerId={getArrayObjectContainerId(property.id)}
          dropPreview={dropPreview}
          nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
          onNestedEditorOpenChange={onNestedEditorOpenChange}
          onPropertiesChange={(properties) =>
            onChange({
              ...property,
              items: {
                type: "object",
                properties,
              },
            })
          }
        />
      ) : items.type === "enum" ? (
        <EnumEditor
          values={items.enumValues ?? []}
          onChange={(enumValues) =>
            onChange({
              ...property,
              items: {
                type: "enum",
                enumValues,
              },
            })
          }
        />
      ) : null}
    </>
  )
}

function NestedEditor({
  property,
  depth,
  onChange,
  dropPreview,
  nestedEditorOpenByPropertyId,
  onNestedEditorOpenChange,
}: {
  property: SchemaBuilderProperty
  depth: number
  onChange: (property: SchemaBuilderProperty) => void
  dropPreview: PropertyMovePreview | null
  nestedEditorOpenByPropertyId: Record<string, boolean>
  onNestedEditorOpenChange: (propertyId: string, open: boolean) => void
}) {
  if (property.type === "enum") {
    return (
      <EnumEditor
        values={property.enumValues ?? []}
        onChange={(enumValues) => onChange({ ...property, enumValues })}
      />
    )
  }

  if (property.type === "object") {
    return (
      <SchemaBuilderTable
        properties={property.properties ?? []}
        depth={depth + 1}
        containerId={getObjectContainerId(property.id)}
        dropPreview={dropPreview}
        nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
        onNestedEditorOpenChange={onNestedEditorOpenChange}
        onPropertiesChange={(properties) =>
          onChange({ ...property, properties })
        }
      />
    )
  }

  if (property.type === "array") {
    return (
      <ArrayItemsEditor
        property={property}
        depth={depth}
        dropPreview={dropPreview}
        nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
        onNestedEditorOpenChange={onNestedEditorOpenChange}
        onChange={onChange}
      />
    )
  }

  return null
}

function SchemaBuilderTable({
  properties,
  depth = 0,
  containerId = ROOT_SCHEMA_CONTAINER_ID,
  dropPreview,
  nestedEditorOpenByPropertyId,
  onNestedEditorOpenChange,
  onPropertiesChange,
}: {
  properties: SchemaBuilderProperty[]
  depth?: number
  containerId?: string
  dropPreview: PropertyMovePreview | null
  nestedEditorOpenByPropertyId: Record<string, boolean>
  onNestedEditorOpenChange: (propertyId: string, open: boolean) => void
  onPropertiesChange: (properties: SchemaBuilderProperty[]) => void
}) {
  const { setNodeRef } = useDroppable({
    id: containerId,
    data: {
      type: SCHEMA_PROPERTY_DRAG_TYPE,
      containerId,
    },
  })
  const sortableItems = useStableIds(properties.map((property) => property.id))
  const updateProperty = useStableCallback(
    (id: string, nextProperty: SchemaBuilderProperty) => {
      onPropertiesChange(
        updatePropertyById(properties, id, () => nextProperty)
      )
    }
  )

  const addProperty = React.useCallback(() => {
    onPropertiesChange([...properties, createProperty()])
  }, [onPropertiesChange, properties])
  const tableDropPreview =
    dropPreview?.containerId === containerId ? dropPreview : null

  return (
    <div
      ref={setNodeRef}
      className="overflow-visible rounded-lg border bg-background"
    >
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/55 text-xs text-muted-foreground">
            <th className="w-[24%] px-3 py-2 text-start font-medium sm:w-[27%]">
              Property key
            </th>
            <th className="w-[36%] border-s px-3 py-2 text-start font-medium sm:w-[23%]">
              Type
            </th>
            <th className="border-s px-3 py-2 text-start font-medium">
              Description
            </th>
          </tr>
        </thead>
        <SortableContext
          id={containerId}
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          {properties.map((property, index) => (
            <React.Fragment key={property.id}>
              {tableDropPreview?.index === index ? (
                <SchemaPropertyDropPreviewRows
                  property={tableDropPreview.property}
                />
              ) : null}
              <SortablePropertyRows
                property={property}
                depth={depth}
                dropPreview={dropPreview}
                nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
                onNestedEditorOpenChange={onNestedEditorOpenChange}
                onPropertyChange={updateProperty}
              />
            </React.Fragment>
          ))}
          {tableDropPreview?.index === properties.length ? (
            <SchemaPropertyDropPreviewRows
              property={tableDropPreview.property}
            />
          ) : null}
        </SortableContext>
        <tbody>
          <tr>
            <td colSpan={3} className="p-0">
              <button
                type="button"
                className="flex h-9 w-full items-center justify-center gap-2 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/55 hover:text-foreground focus-visible:bg-muted/55 focus-visible:text-foreground"
                onClick={addProperty}
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
                Add property
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const SortablePropertyRows = React.memo(function SortablePropertyRows({
  property,
  depth,
  dropPreview,
  nestedEditorOpenByPropertyId,
  onNestedEditorOpenChange,
  onPropertyChange,
}: {
  property: SchemaBuilderProperty
  depth: number
  dropPreview: PropertyMovePreview | null
  nestedEditorOpenByPropertyId: Record<string, boolean>
  onNestedEditorOpenChange: (propertyId: string, open: boolean) => void
  onPropertyChange: (id: string, property: SchemaBuilderProperty) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: property.id,
    data: {
      type: SCHEMA_PROPERTY_DRAG_TYPE,
    },
  })
  const handlePropertyChange = React.useCallback(
    (nextProperty: SchemaBuilderProperty) => {
      onPropertyChange(nextProperty.id, nextProperty)
    },
    [onPropertyChange]
  )
  const hasNestedEditor = propertyHasNestedEditor(property)
  const isNestedEditorOpen = nestedEditorOpenByPropertyId[property.id] ?? true
  const nestedEditorLabel = getNestedEditorLabel(property)

  return (
    <tbody
      ref={setNodeRef}
      data-schema-builder-property-id={property.id}
      className={cn(
        "motion-reduce:!transition-none",
        isDragging && "relative z-10 opacity-70"
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <tr
        data-schema-builder-property-row-id={property.id}
        className={cn(
          "group/property-row border-b",
          hasNestedEditor && "bg-muted/20"
        )}
      >
        <td className="relative p-0 align-top">
          <button
            type="button"
            className={cn(
              "absolute top-1/2 start-0 z-50 grid size-5 -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-md border bg-background text-muted-foreground opacity-0 shadow-sm transition-[opacity,color,box-shadow] outline-none group-hover/property-row:opacity-100 hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing motion-reduce:transition-none rtl:translate-x-1/2",
              isDragging && "opacity-100"
            )}
            aria-label={`Drag ${property.key || "property"}`}
            {...attributes}
            {...listeners}
          >
            <HugeiconsIcon icon={DragDropVerticalIcon} className="size-3.5" />
          </button>
          <div className="min-w-0">
            <InlineTextInput
              value={property.key}
              placeholder={depth ? "nested_key" : "property_key"}
              className="font-mono"
              spellCheck={false}
              onChange={(event) =>
                handlePropertyChange({
                  ...property,
                  key: event.target.value,
                })
              }
            />
          </div>
        </td>
        <td className="border-s p-1 align-top">
          <SchemaTypeMenu
            property={property}
            onChange={handlePropertyChange}
          />
        </td>
        <td className="border-s p-0 align-top">
          <InlineTextInput
            value={property.description}
            placeholder="Describe what this field should extract."
            onChange={(event) =>
              handlePropertyChange({
                ...property,
                description: event.target.value,
              })
            }
          />
        </td>
      </tr>
      {hasNestedEditor ? (
        <tr className="border-b bg-muted/20">
          <td colSpan={3} className="p-0">
            <Collapsible
              open={isNestedEditorOpen}
              onOpenChange={(open) =>
                onNestedEditorOpenChange(property.id, open)
              }
            >
              <div className="group/collapsible-trigger-row flex h-8 w-full items-center transition-colors focus-within:bg-muted/55 hover:bg-muted/55">
                <CollapsibleTrigger
                  className="flex h-full min-w-0 flex-1 items-center gap-2 px-3 text-start text-xs font-medium text-muted-foreground transition-colors outline-none group-hover/collapsible-trigger-row:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none"
                  type="button"
                >
                  <HugeiconsIcon
                    icon={ChevronDown}
                    className={cn(
                      "size-3.5 shrink-0 transition-transform duration-200",
                      !isNestedEditorOpen && "-rotate-90"
                    )}
                  />
                  <span className="min-w-0 truncate">{nestedEditorLabel}</span>
                </CollapsibleTrigger>
                {property.type === "array" ? (
                  <div className="flex h-full shrink-0 items-center px-2">
                    <ArrayItemTypeMenu
                      property={property}
                      onChange={handlePropertyChange}
                    />
                  </div>
                ) : null}
              </div>
              <CollapsiblePanel>
                <div
                  className="p-2 ps-[--schema-builder-nest-indent]"
                  style={
                    {
                      "--schema-builder-nest-indent": `${
                        0.5 + Math.min(depth, 4) * 0.75
                      }rem`,
                    } as React.CSSProperties
                  }
                >
                  <NestedEditor
                    property={property}
                    depth={depth}
                    dropPreview={dropPreview}
                    nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
                    onNestedEditorOpenChange={onNestedEditorOpenChange}
                    onChange={handlePropertyChange}
                  />
                </div>
              </CollapsiblePanel>
            </Collapsible>
          </td>
        </tr>
      ) : null}
    </tbody>
  )
})

function SchemaPropertyDropPreviewRows({
  property,
}: {
  property: SchemaBuilderProperty
}) {
  return (
    <tbody
      className="pointer-events-none"
      aria-label={`Insert ${property.key || "property"} here`}
    >
      <tr className="h-0">
        <td colSpan={3} className="p-0">
          <div className="relative z-20 h-0 overflow-visible">
            <div className="absolute inset-x-2 top-0 h-px -translate-y-1/2 bg-primary" />
            <div className="absolute top-0 start-2 size-1.5 -translate-y-1/2 rounded-full bg-primary" />
          </div>
        </td>
      </tr>
    </tbody>
  )
}

function SchemaPropertyDragOverlay({
  property,
  isNestedEditorOpen,
  nestedEditorOpenByPropertyId,
}: {
  property: SchemaBuilderProperty
  isNestedEditorOpen: boolean
  nestedEditorOpenByPropertyId: Record<string, boolean>
}) {
  const hasNestedEditor = propertyHasNestedEditor(property)

  return (
    <div className="w-[min(680px,calc(100vw-2rem))] overflow-hidden rounded-lg border bg-background text-sm shadow-lg">
      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.35fr)] items-center",
          hasNestedEditor && "bg-muted/20"
        )}
      >
        <div className="min-w-0 px-3 py-2 font-mono">
          <span className="block truncate">
            {property.key || "property_key"}
          </span>
        </div>
        <div className="border-s px-2 py-1.5">
          <SchemaTypeBadge type={getTypeStyleKey(property)} />
        </div>
        <div className="min-w-0 border-s px-3 py-2 text-muted-foreground">
          <span className="block truncate">
            {property.description || "Describe what this field should extract."}
          </span>
        </div>
      </div>
      {hasNestedEditor ? (
        <div className="border-t bg-muted/20">
          <div className="flex h-8 items-center gap-2 px-3 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon
              icon={ChevronDown}
              className={cn(
                "size-3.5 shrink-0",
                !isNestedEditorOpen && "-rotate-90"
              )}
            />
            <span className="min-w-0 truncate">
              {getNestedEditorLabel(property)}
            </span>
            {property.type === "array" ? (
              <div className="ms-auto shrink-0">
                <SchemaTypeBadge
                  type={`array-${property.items?.type ?? "string"}`}
                />
              </div>
            ) : null}
          </div>
          {isNestedEditorOpen ? (
            <div className="max-h-[280px] overflow-hidden p-2">
              <NestedEditorPreview
                property={property}
                nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function NestedEditorPreview({
  property,
  nestedEditorOpenByPropertyId,
}: {
  property: SchemaBuilderProperty
  nestedEditorOpenByPropertyId: Record<string, boolean>
}) {
  if (property.type === "enum") {
    return <EnumValuesPreview values={property.enumValues ?? []} />
  }

  if (property.type === "object") {
    return (
      <SchemaPropertiesPreview
        properties={property.properties ?? []}
        nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
      />
    )
  }

  if (property.type === "array") {
    const items = property.items ?? { type: "string" as const }

    if (items.type === "enum") {
      return <EnumValuesPreview values={items.enumValues ?? []} />
    }

    if (items.type === "object") {
      return (
        <SchemaPropertiesPreview
          properties={items.properties ?? []}
          nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
        />
      )
    }
  }

  return null
}

function EnumValuesPreview({ values }: { values: SchemaBuilderEnumValue[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] border-b bg-muted/55 text-xs font-medium text-muted-foreground">
        <div className="px-3 py-2">Value</div>
        <div className="border-s px-3 py-2">Description</div>
      </div>
      {values.map((value) => (
        <div
          key={value.id}
          className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] border-b last:border-b-0"
        >
          <div className="min-w-0 px-3 py-2 font-mono">
            <span className="block truncate">{value.value || "value"}</span>
          </div>
          <div className="min-w-0 border-s px-3 py-2 text-muted-foreground">
            <span className="block truncate">
              {value.description || "Description"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SchemaPropertiesPreview({
  properties,
  nestedEditorOpenByPropertyId,
}: {
  properties: SchemaBuilderProperty[]
  nestedEditorOpenByPropertyId: Record<string, boolean>
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)] border-b bg-muted/55 text-xs font-medium text-muted-foreground">
        <div className="px-3 py-2">Property key</div>
        <div className="border-s px-3 py-2">Type</div>
        <div className="border-s px-3 py-2">Description</div>
      </div>
      {properties.map((property) => {
        const hasNestedEditor = propertyHasNestedEditor(property)
        const isNestedEditorOpen =
          nestedEditorOpenByPropertyId[property.id] ?? true

        return (
          <div key={property.id} className="border-b last:border-b-0">
            <div
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)] items-center",
                hasNestedEditor && "bg-muted/20"
              )}
            >
              <div className="min-w-0 px-3 py-2 font-mono">
                <span className="block truncate">
                  {property.key || "property_key"}
                </span>
              </div>
              <div className="border-s px-2 py-1.5">
                <SchemaTypeBadge type={getTypeStyleKey(property)} />
              </div>
              <div className="min-w-0 border-s px-3 py-2 text-muted-foreground">
                <span className="block truncate">
                  {property.description || "Description"}
                </span>
              </div>
            </div>
            {hasNestedEditor ? (
              <div className="border-t bg-muted/20">
                <div className="flex h-7 items-center gap-2 px-3 text-xs font-medium text-muted-foreground">
                  <HugeiconsIcon
                    icon={ChevronDown}
                    className={cn(
                      "size-3.5 shrink-0",
                      !isNestedEditorOpen && "-rotate-90"
                    )}
                  />
                  <span className="min-w-0 truncate">
                    {getNestedEditorLabel(property)}
                  </span>
                </div>
                {isNestedEditorOpen ? (
                  <div className="p-2">
                    <NestedEditorPreview
                      property={property}
                      nestedEditorOpenByPropertyId={
                        nestedEditorOpenByPropertyId
                      }
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export const SchemaJsonView = React.memo(function SchemaJsonView({
  scrollResetKey = 0,
  schema,
  theme,
}: {
  scrollResetKey?: React.Key
  schema: SchemaBuilderSchema
  theme?: SchemaBuilderTheme
}) {
  const codeThemeType = useResolvedCodeThemeType(theme)
  const file = React.useMemo(() => {
    const contents = formatJson(serializeSchema(schema))

    return {
      name: "schema.json",
      contents,
      lang: "json" as const,
      cacheKey: contents,
    }
  }, [schema])

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
          key={`${file.cacheKey}:${codeThemeType}:${String(scrollResetKey)}`}
          className="h-full min-w-0"
          contentClassName="min-w-full"
        >
          <File
            key={`${file.cacheKey}:${codeThemeType}`}
            className="block min-w-full"
            file={file}
            metrics={CODE_VIRTUAL_FILE_METRICS}
            style={CODE_FILE_THEME}
            options={{
              disableFileHeader: true,
              overflow: "scroll",
              themeType: codeThemeType,
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
})

export function SchemaBuilderPanel({
  className,
  defaultSchema = SAMPLE_SCHEMA,
  schema: controlledSchema,
  onSchemaChange,
  theme,
}: {
  className?: string
  defaultSchema?: SchemaBuilderSchema
  schema?: SchemaBuilderSchema
  onSchemaChange?: (schema: SchemaBuilderSchema) => void
  theme?: SchemaBuilderTheme
} = {}) {
  const [activeTab, setActiveTab] = React.useState("form")
  const [jsonScrollResetKey, setJsonScrollResetKey] = React.useState(0)
  const sensors = useSchemaBuilderSensors()
  const dndContextId = React.useId()
  const lastSchemaOverIdRef = React.useRef<UniqueIdentifier | null>(null)
  const [activeDragProperty, setActiveDragProperty] =
    React.useState<SchemaBuilderProperty | null>(null)
  const [activeSchemaDrag, setActiveSchemaDrag] = React.useState<{
    activeId: string
    overId: string | null
  } | null>(null)
  const [nestedEditorOpenByPropertyId, setNestedEditorOpenByPropertyId] =
    React.useState<Record<string, boolean>>({})
  const [uncontrolledSchema, setUncontrolledSchema] =
    React.useState(defaultSchema)
  const schema = controlledSchema ?? uncontrolledSchema
  // The JSON tab stays mounted, so feed it a schema frozen while it is
  // hidden; otherwise every form keystroke re-serializes and re-highlights
  // the code view. Syncing during render keeps it fresh once visible.
  const [jsonViewSchema, setJsonViewSchema] = React.useState(schema)

  if (activeTab === "json" && jsonViewSchema !== schema) {
    setJsonViewSchema(schema)
  }

  const dropPreview = React.useMemo(() => {
    if (!activeSchemaDrag?.overId) return null

    return getPropertyMovePreview(
      schema.properties,
      activeSchemaDrag.activeId,
      activeSchemaDrag.overId
    )
  }, [activeSchemaDrag, schema.properties])

  const updateSchema = React.useCallback(
    (nextSchema: SchemaBuilderSchema) => {
      if (!controlledSchema) {
        setUncontrolledSchema(nextSchema)
      }

      onSchemaChange?.(nextSchema)
    },
    [controlledSchema, onSchemaChange]
  )
  const handleNestedEditorOpenChange = React.useCallback(
    (propertyId: string, open: boolean) => {
      setNestedEditorOpenByPropertyId((current) => {
        if ((current[propertyId] ?? true) === open) return current

        return {
          ...current,
          [propertyId]: open,
        }
      })
    },
    []
  )
  const schemaCollisionDetection = React.useCallback<CollisionDetection>(
    (args) => {
      if (args.active.data.current?.type !== SCHEMA_PROPERTY_DRAG_TYPE) {
        return closestCenter(args)
      }

      const pointerIntersections = pointerWithin(args)
      const schemaPointerIntersections = pointerIntersections
        .filter(({ id }) =>
          isSchemaCollisionCandidate(
            schema.properties,
            id,
            args.active.id,
            args
          )
        )
        .sort(
          (first, second) =>
            getDroppableRectArea(args.droppableRects, first.id) -
            getDroppableRectArea(args.droppableRects, second.id)
        )
      const isPointerOverActive = pointerIntersections.some(
        ({ id }) => id === args.active.id
      )

      if (
        schemaPointerIntersections.length === 0 &&
        isPointerOverActive &&
        lastSchemaOverIdRef.current
      ) {
        return [{ id: lastSchemaOverIdRef.current }]
      }

      const intersections =
        schemaPointerIntersections.length > 0
          ? schemaPointerIntersections
          : rectIntersection(args).filter(({ id }) =>
              isSchemaCollisionCandidate(
                schema.properties,
                id,
                args.active.id,
                args
              )
            )
      let overId = getFirstCollision(intersections, "id")

      if (overId != null) {
        overId =
          getProjectedPropertyChildContainerId(
            schema.properties,
            overId,
            args
          ) ?? overId

        if (isPropertyContainerId(overId)) {
          const containerProperties = getContainerProperties(
            schema.properties,
            String(overId)
          )

          if (
            containerProperties.length > 0 &&
            !isPointerBelowLastContainerProperty(containerProperties, args)
          ) {
            const closestChild = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerProperties.some(
                    (property) => property.id === container.id
                  ) &&
                  isSchemaCollisionCandidate(
                    schema.properties,
                    container.id,
                    args.active.id,
                    args
                  )
              ),
            })
            const closestChildId = getFirstCollision(closestChild, "id")

            overId = closestChildId
              ? (getProjectedPropertyChildContainerId(
                  schema.properties,
                  closestChildId,
                  args
                ) ?? closestChildId)
              : overId
          }
        }

        overId = resolveCrossContainerPropertyInsertionId(
          schema.properties,
          args.active.id,
          overId,
          args
        )
        lastSchemaOverIdRef.current = overId

        return [{ id: overId }]
      }

      return lastSchemaOverIdRef.current
        ? [{ id: lastSchemaOverIdRef.current }]
        : []
    },
    [schema.properties]
  )
  const handleSchemaDragStart = React.useCallback(
    (event: DragStartEvent) => {
      if (event.active.data.current?.type !== SCHEMA_PROPERTY_DRAG_TYPE) {
        return
      }

      lastSchemaOverIdRef.current = null
      const activeId = String(event.active.id)
      setActiveDragProperty(
        findPropertyLocation(schema.properties, activeId)?.property ?? null
      )
      setActiveSchemaDrag({
        activeId,
        overId: null,
      })
    },
    [schema.properties]
  )
  const handleSchemaDragOver = React.useCallback(
    (event: DragOverEvent) => {
      if (event.active.data.current?.type !== SCHEMA_PROPERTY_DRAG_TYPE) {
        return
      }

      const activeId = String(event.active.id)
      const eventOverId = event.over ? String(event.over.id) : null
      const candidateOverIds = [
        eventOverId,
        lastSchemaOverIdRef.current
          ? String(lastSchemaOverIdRef.current)
          : null,
      ]
      const overId =
        candidateOverIds.find(
          (candidateOverId) =>
            candidateOverId &&
            candidateOverId !== activeId &&
            getPropertyMovePreview(schema.properties, activeId, candidateOverId)
        ) ?? null

      setActiveSchemaDrag((current) => {
        if (current?.activeId === activeId && current?.overId === overId) {
          return current
        }

        return {
          activeId,
          overId,
        }
      })
    },
    [schema.properties]
  )
  const handleSchemaDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      setActiveDragProperty(null)
      setActiveSchemaDrag(null)

      const { active, over } = event
      if (active.data.current?.type !== SCHEMA_PROPERTY_DRAG_TYPE) {
        lastSchemaOverIdRef.current = null
        return
      }

      const activeId = String(active.id)
      const candidateOverIds = [
        over ? String(over.id) : null,
        lastSchemaOverIdRef.current
          ? String(lastSchemaOverIdRef.current)
          : null,
      ]
      const overId =
        candidateOverIds.find(
          (candidateOverId) => candidateOverId && candidateOverId !== activeId
        ) ?? null

      lastSchemaOverIdRef.current = null

      if (!overId) return

      const nextProperties = moveProperty(schema.properties, activeId, overId)

      if (nextProperties === schema.properties) return

      updateSchema({
        properties: nextProperties,
      })
    },
    [schema.properties, updateSchema]
  )
  const handleSchemaDragCancel = React.useCallback(() => {
    lastSchemaOverIdRef.current = null
    setActiveDragProperty(null)
    setActiveSchemaDrag(null)
  }, [])
  const handleTabChange = React.useCallback((nextTab: string) => {
    setActiveTab(nextTab)

    if (nextTab === "json") {
      setJsonScrollResetKey((current) => current + 1)
    }
  }, [])

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn("flex h-[560px] flex-col gap-0 bg-background", className)}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 border-b px-3">
        <TabsList className="h-8 sm:h-7">
          <TabsTrigger value="form" className="h-7 sm:h-6">
            <HugeiconsIcon icon={TableIcon} className="size-4" />
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
          <DndContext
            id={`schema-builder-${dndContextId}`}
            autoScroll={{
              threshold: { x: 0.05, y: 0.14 },
              acceleration: 8,
            }}
            sensors={sensors}
            collisionDetection={schemaCollisionDetection}
            measuring={SCHEMA_DND_MEASURING}
            onDragStart={handleSchemaDragStart}
            onDragOver={handleSchemaDragOver}
            onDragEnd={handleSchemaDragEnd}
            onDragCancel={handleSchemaDragCancel}
          >
            <div className="p-3">
              <SchemaBuilderTable
                properties={schema.properties}
                dropPreview={dropPreview}
                nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
                onNestedEditorOpenChange={handleNestedEditorOpenChange}
                onPropertiesChange={(properties) =>
                  updateSchema({ properties })
                }
              />
            </div>
            <DragOverlay adjustScale={false}>
              {activeDragProperty ? (
                <SchemaPropertyDragOverlay
                  property={activeDragProperty}
                  isNestedEditorOpen={
                    nestedEditorOpenByPropertyId[activeDragProperty.id] ?? true
                  }
                  nestedEditorOpenByPropertyId={nestedEditorOpenByPropertyId}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="json" keepMounted className="min-h-0 flex-1">
        <SchemaJsonView
          scrollResetKey={jsonScrollResetKey}
          schema={jsonViewSchema}
          theme={theme}
        />
      </TabsContent>
    </Tabs>
  )
}
