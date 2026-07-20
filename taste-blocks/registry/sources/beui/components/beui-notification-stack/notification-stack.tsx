"use client";

import { ArrowUpRight, BellOff } from "lucide-react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import {
  useCallback,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ActionSwapText } from "./beui-action-swap";
import { EASE_OUT, SPRING_LAYOUT } from "../../lib/taste-blocks/beui/ease";
import { useHoverCapable } from "../../hooks/taste-blocks/beui/use-hover-capable";
import { cn } from "../../lib/taste-blocks/beui/utils";

export type NotificationStackItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
};

export type NotificationStackClassNames = {
  stack?: string;
  card?: string;
  content?: string;
  title?: string;
  description?: string;
  trailing?: string;
  footer?: string;
  count?: string;
};

export interface NotificationStackProps {
  items: NotificationStackItem[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onViewAll?: () => void;
  maxVisible?: number;
  collapsedLabel?: string;
  expandedLabel?: string;
  emptyLabel?: string;
  className?: string;
  classNames?: NotificationStackClassNames;
}

const STACK_PEEK = 8;
const STACK_INSET = 12;

function useControllableExpanded({
  expanded,
  defaultExpanded,
  onExpandedChange,
}: {
  expanded?: boolean;
  defaultExpanded: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const value = expanded ?? internalExpanded;

  const setValue = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  return [value, setValue] as const;
}

function NotificationCardContent({
  item,
  classNames,
}: {
  item: NotificationStackItem;
  classNames?: NotificationStackClassNames;
}) {
  return (
    <span
      className={cn("flex min-w-0 flex-col gap-1.5 py-4", classNames?.content)}
    >
      <span className="flex min-w-0 items-start justify-between gap-3">
        <span
          className={cn(
            "min-w-0 text-sm font-medium leading-snug",
            classNames?.title,
          )}
        >
          {item.title}
        </span>
        {item.trailing ? (
          <span className={cn("shrink-0 text-xs", classNames?.trailing)}>
            {item.trailing}
          </span>
        ) : null}
      </span>
      {item.description ? (
        <span
          className={cn(
            "text-xs leading-relaxed text-muted-foreground",
            classNames?.description,
          )}
        >
          {item.description}
        </span>
      ) : null}
    </span>
  );
}

export function NotificationStack({
  items,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  onViewAll,
  maxVisible = 3,
  collapsedLabel = "Notifications",
  expandedLabel = "View all",
  emptyLabel = "All caught up",
  className,
  classNames,
}: NotificationStackProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const hasFocus = useRef(false);
  const [isExpanded, setIsExpanded] = useControllableExpanded({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });

  const visibleItems = items.slice(0, Math.max(1, maxVisible));
  const primaryItem = visibleItems[0];
  const transition: Transition = reduce ? { duration: 0 } : SPRING_LAYOUT;
  const cardTransition: Transition = reduce
    ? { duration: 0 }
    : { duration: 0.32, ease: EASE_OUT };
  const backgroundTransition: Transition = reduce
    ? { duration: 0 }
    : { duration: 0.26, ease: EASE_OUT };

  if (!primaryItem) {
    return (
      <div
        className={cn(
          "flex w-full max-w-[22rem] items-center justify-center gap-2 rounded-3xl bg-muted/70 px-5 py-8 text-sm font-medium text-muted-foreground",
          className,
        )}
      >
        <BellOff className="h-4 w-4" aria-hidden="true" />
        {emptyLabel}
      </div>
    );
  }

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    hasFocus.current = false;
    setIsExpanded(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    setIsExpanded(false);
    event.currentTarget.blur();
  };

  const handleClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    if (onViewAll) {
      onViewAll();
      return;
    }

    setIsExpanded(false);
  };

  return (
    <motion.button
      type="button"
      initial={false}
      aria-expanded={isExpanded}
      aria-label={
        isExpanded
          ? onViewAll
            ? `${items.length} notifications. ${expandedLabel}.`
            : `${items.length} notifications. Collapse notifications.`
          : `${items.length} notifications. Expand notifications.`
      }
      onPointerEnter={() => {
        if (canHover) setIsExpanded(true);
      }}
      onPointerLeave={() => {
        if (canHover && !hasFocus.current) setIsExpanded(false);
      }}
      onFocus={() => {
        hasFocus.current = true;
        setIsExpanded(true);
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      className={cn(
        "relative z-10 block w-full max-w-[22rem] cursor-pointer rounded-3xl text-left text-foreground outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* This invisible first card gives the button its compact intrinsic footprint. */}
      <span aria-hidden="true" className="invisible block p-3">
        <span className="block">
          <span
            className={cn(
              "block rounded-2xl border border-transparent px-4",
              classNames?.card,
            )}
          >
            <NotificationCardContent
              item={primaryItem}
              classNames={classNames}
            />
          </span>
        </span>
        <span className="mt-2 block h-9" />
      </span>

      <span className="absolute inset-x-0 bottom-0 block p-3">
        <motion.span
          aria-hidden="true"
          layout
          initial={false}
          transition={backgroundTransition}
          className="absolute inset-0 rounded-3xl bg-muted"
        />
        <span
          className={cn(
            "relative z-10 grid gap-1",
            !isExpanded && "pb-2",
            classNames?.stack,
          )}
        >
          {visibleItems.map((item, index) => {
            const isPrimary = index === 0;

            return (
              <motion.span
                key={item.id}
                layout="position"
                initial={false}
                animate={{
                  y: isExpanded ? 0 : index * STACK_PEEK,
                  clipPath: isExpanded
                    ? "inset(0px 0px round 16px)"
                    : `inset(0px ${index * STACK_INSET}px round 16px)`,
                }}
                transition={cardTransition}
                className={cn(
                  "block rounded-2xl border border-border/60 bg-background px-4",
                  classNames?.card,
                )}
                style={{
                  zIndex: visibleItems.length - index,
                  gridColumn: 1,
                  gridRow: isExpanded ? index + 1 : 1,
                }}
              >
                <span
                  className={cn(
                    "block",
                    !isPrimary && !isExpanded && "invisible",
                  )}
                >
                  <NotificationCardContent
                    item={item}
                    classNames={classNames}
                  />
                </span>
              </motion.span>
            );
          })}
        </span>

        <motion.span
          layout="position"
          transition={transition}
          className={cn(
            "relative z-10 mt-2 flex min-h-9 items-center gap-2 px-1",
            classNames?.footer,
          )}
        >
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full bg-orange-600 text-xs font-medium text-white shadow-[inset_0_1px_2px_rgb(0_0_0/0.2),inset_0_-1px_0_rgb(255_255_255/0.16)] dark:bg-orange-500",
              classNames?.count,
            )}
          >
            {items.length}
          </span>
          <span className="flex items-center text-sm font-medium">
            <ActionSwapText
              value={isExpanded ? "expanded" : "collapsed"}
              animation="roll"
            >
              {isExpanded ? (
                <span className="inline-flex items-center gap-1">
                  {expandedLabel}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </span>
              ) : (
                collapsedLabel
              )}
            </ActionSwapText>
          </span>
        </motion.span>
      </span>
    </motion.button>
  );
}
