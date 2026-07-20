"use client"

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  type ComponentProps,
  type MouseEvent,
} from "react"
import { useControllableState } from "@radix-ui/react-use-controllable-state"

/* -----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type VoteTallyValue = Record<string, number>

export interface VoteTallyRootProps
  extends Omit<ComponentProps<"div">, "defaultValue"> {
  /** Current vote counts (controlled) */
  value?: VoteTallyValue
  /** Initial vote counts (uncontrolled) */
  defaultValue?: VoteTallyValue
  /** Callback when votes change */
  onValueChange?: (value: VoteTallyValue) => void
  /** Set of item IDs the current user has voted for */
  votedItems?: Set<string>
  /** Default voted items (uncontrolled) */
  defaultVotedItems?: Set<string>
  /** Callback when user votes/unvotes */
  onVotedItemsChange?: (votedItems: Set<string>) => void
  /** Whether voting is disabled */
  disabled?: boolean
}

export interface VoteTallyItemProps extends ComponentProps<"div"> {
  /** Unique identifier for this item */
  value: string
  /** Whether this specific item is disabled */
  disabled?: boolean
}

export type VoteTallyTriggerProps = ComponentProps<"button">

export type VoteTallyCountProps = ComponentProps<"span">

export type VoteTallyTitleProps = ComponentProps<"span">

export type VoteTallyDescriptionProps = ComponentProps<"span">

export interface VoteTallyGroupProps extends ComponentProps<"div"> {
  /** Sort items by vote count */
  sortBy?: "votes-asc" | "votes-desc" | "none"
}

/* -----------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------- */

interface VoteTallyContextValue {
  votes: VoteTallyValue
  votedItems: Set<string>
  disabled: boolean
  vote: (itemId: string) => void
  unvote: (itemId: string) => void
  toggleVote: (itemId: string) => void
  getVoteCount: (itemId: string) => number
  hasVoted: (itemId: string) => boolean
}

const VoteTallyContext = createContext<VoteTallyContextValue | null>(null)

function useVoteTallyContext() {
  const context = useContext(VoteTallyContext)
  if (!context) {
    throw new Error("VoteTally components must be used within VoteTally.Root")
  }
  return context
}

interface VoteTallyItemContextValue {
  itemId: string
  disabled: boolean
}

const VoteTallyItemContext = createContext<VoteTallyItemContextValue | null>(
  null
)

function useVoteTallyItemContext() {
  const context = useContext(VoteTallyItemContext)
  if (!context) {
    throw new Error(
      "VoteTally.Item sub-components must be used within VoteTally.Item"
    )
  }
  return context
}

/* -----------------------------------------------------------------------------
 * Root
 * -------------------------------------------------------------------------- */

function VoteTallyRoot({
  value: controlledValue,
  defaultValue = {},
  onValueChange,
  votedItems: controlledVotedItems,
  defaultVotedItems,
  onVotedItemsChange,
  disabled = false,
  children,
  ...props
}: VoteTallyRootProps) {
  const [votes, setVotes] = useControllableState<VoteTallyValue>({
    prop: controlledValue,
    defaultProp: defaultValue,
    onChange: onValueChange,
  })

  const [votedItemsArray, setVotedItemsArray] = useControllableState({
    prop: controlledVotedItems ? Array.from(controlledVotedItems) : undefined,
    defaultProp: defaultVotedItems ? Array.from(defaultVotedItems) : [],
    onChange: (arr) => onVotedItemsChange?.(new Set(arr)),
  })

  const votedItems = useMemo(() => new Set(votedItemsArray), [votedItemsArray])

  const vote = useCallback(
    (itemId: string) => {
      if (disabled || votedItems.has(itemId)) {
        return
      }

      setVotes((prev) => ({
        ...prev,
        [itemId]: (prev?.[itemId] ?? 0) + 1,
      }))
      setVotedItemsArray((prev) => [...(prev ?? []), itemId])
    },
    [disabled, votedItems, setVotes, setVotedItemsArray]
  )

  const unvote = useCallback(
    (itemId: string) => {
      if (disabled || !votedItems.has(itemId)) {
        return
      }

      setVotes((prev) => ({
        ...prev,
        [itemId]: Math.max((prev?.[itemId] ?? 0) - 1, 0),
      }))
      setVotedItemsArray((prev) => (prev ?? []).filter((id) => id !== itemId))
    },
    [disabled, votedItems, setVotes, setVotedItemsArray]
  )

  const toggleVote = useCallback(
    (itemId: string) => {
      if (votedItems.has(itemId)) {
        unvote(itemId)
      } else {
        vote(itemId)
      }
    },
    [votedItems, vote, unvote]
  )

  const getVoteCount = useCallback(
    (itemId: string) => votes?.[itemId] ?? 0,
    [votes]
  )

  const hasVoted = useCallback(
    (itemId: string) => votedItems.has(itemId),
    [votedItems]
  )

  const contextValue = useMemo(
    () => ({
      votes: votes ?? {},
      votedItems,
      disabled,
      vote,
      unvote,
      toggleVote,
      getVoteCount,
      hasVoted,
    }),
    [
      votes,
      votedItems,
      disabled,
      vote,
      unvote,
      toggleVote,
      getVoteCount,
      hasVoted,
    ]
  )

  return (
    <VoteTallyContext.Provider value={contextValue}>
      <div
        aria-label="Vote tally list"
        data-disabled={disabled ? true : undefined}
        role="list"
        {...props}
      >
        {children}
      </div>
    </VoteTallyContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Group (optional sorting wrapper)
 * -------------------------------------------------------------------------- */

function VoteTallyGroup({
  sortBy = "none",
  children,
  ...props
}: VoteTallyGroupProps) {
  const { votes } = useVoteTallyContext()

  const sortedChildren = useMemo(() => {
    if (sortBy === "none") {
      return children
    }

    const childArray = Children.toArray(children)

    return childArray.sort((a, b) => {
      if (!(isValidElement(a) && isValidElement(b))) {
        return 0
      }

      const aValue = (a.props as VoteTallyItemProps).value
      const bValue = (b.props as VoteTallyItemProps).value
      const aVotes = votes[aValue] ?? 0
      const bVotes = votes[bValue] ?? 0

      return sortBy === "votes-desc" ? bVotes - aVotes : aVotes - bVotes
    })
  }, [children, sortBy, votes])

  return (
    <div role="presentation" {...props}>
      {sortedChildren}
    </div>
  )
}

/* -----------------------------------------------------------------------------
 * Item
 * -------------------------------------------------------------------------- */

function VoteTallyItem({
  value,
  disabled: itemDisabled = false,
  children,
  ...props
}: VoteTallyItemProps) {
  const {
    disabled: rootDisabled,
    hasVoted,
    getVoteCount,
  } = useVoteTallyContext()
  const disabled = rootDisabled || itemDisabled
  const voted = hasVoted(value)
  const voteCount = getVoteCount(value)

  const itemContextValue = useMemo(
    () => ({ itemId: value, disabled }),
    [value, disabled]
  )

  return (
    <VoteTallyItemContext.Provider value={itemContextValue}>
      <div
        data-disabled={disabled ? true : undefined}
        data-item={value}
        role="listitem"
        data-slot="vote-tally-item"
        data-vote-count={voteCount}
        data-voted={voted ? true : undefined}
        {...props}
      >
        {children}
      </div>
    </VoteTallyItemContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Trigger
 * -------------------------------------------------------------------------- */

function VoteTallyTrigger({
  children,
  onClick,
  ...props
}: VoteTallyTriggerProps) {
  const { toggleVote, hasVoted, disabled: rootDisabled } = useVoteTallyContext()
  const { itemId, disabled: itemDisabled } = useVoteTallyItemContext()

  const disabled = rootDisabled || itemDisabled
  const voted = hasVoted(itemId)

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!(event.defaultPrevented || disabled)) {
        toggleVote(itemId)
      }
    },
    [onClick, disabled, toggleVote, itemId]
  )

  return (
    <button
      aria-label={voted ? `Remove vote from ${itemId}` : `Vote for ${itemId}`}
      aria-pressed={voted}
      data-slot="vote-tally-trigger"
      data-state={voted ? "voted" : "idle"}
      disabled={disabled}
      onClick={handleClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

/* -----------------------------------------------------------------------------
 * Count
 * -------------------------------------------------------------------------- */

function VoteTallyCount({ children, ...props }: VoteTallyCountProps) {
  const { getVoteCount } = useVoteTallyContext()
  const { itemId } = useVoteTallyItemContext()

  const count = getVoteCount(itemId)

  return (
    <span
      aria-atomic="true"
      aria-live="polite"
      data-slot="vote-tally-count"
      {...props}
    >
      {children ?? count}
    </span>
  )
}

/* -----------------------------------------------------------------------------
 * Title
 * -------------------------------------------------------------------------- */

function VoteTallyTitle({ children, ...props }: VoteTallyTitleProps) {
  return (
    <span data-slot="vote-tally-title" {...props}>
      {children}
    </span>
  )
}

/* -----------------------------------------------------------------------------
 * Description
 * -------------------------------------------------------------------------- */

function VoteTallyDescription({
  children,
  ...props
}: VoteTallyDescriptionProps) {
  return (
    <span data-slot="vote-tally-description" {...props}>
      {children}
    </span>
  )
}

/* -----------------------------------------------------------------------------
 * Hook for external access
 * -------------------------------------------------------------------------- */

export function useVoteTally() {
  return useVoteTallyContext()
}

/* -----------------------------------------------------------------------------
 * Export
 * -------------------------------------------------------------------------- */

export const VoteTally = {
  Root: VoteTallyRoot,
  Group: VoteTallyGroup,
  Item: VoteTallyItem,
  Trigger: VoteTallyTrigger,
  Count: VoteTallyCount,
  Title: VoteTallyTitle,
  Description: VoteTallyDescription,
}

export {
  VoteTallyRoot,
  VoteTallyGroup,
  VoteTallyItem,
  VoteTallyTrigger,
  VoteTallyCount,
  VoteTallyTitle,
  VoteTallyDescription,
}
