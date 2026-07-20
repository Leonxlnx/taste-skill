"use client";

import { MoreHorizontal, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EASE_OUT } from "../../lib/taste-blocks/beui/ease";
import { useHoverCapable } from "../../hooks/taste-blocks/beui/use-hover-capable";
import { cn } from "../../lib/taste-blocks/beui/utils";

export type OverflowActionsSize = "sm" | "md";

export type OverflowActionItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel: string;
};

export type OverflowActionsClassNames = {
  root?: string;
  track?: string;
  action?: string;
  primaryAction?: string;
  overflowAction?: string;
  toggle?: string;
  icon?: string;
  label?: string;
};

export interface OverflowActionsProps {
  primaryActions: OverflowActionItem[];
  overflowActions: OverflowActionItem[];
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onAction?: (item: OverflowActionItem) => void;
  collapseOnAction?: boolean;
  size?: OverflowActionsSize;
  openLabel?: string;
  closeLabel?: string;
  className?: string;
  classNames?: OverflowActionsClassNames;
}

// This needs a softer layout spring than the app defaults so the overflow group
// stays visually attached to the toggle while entering and leaving.
const SHELL_TRANSITION: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 17,
  mass: 0.85,
};

const ICON_VARIANTS: Variants = {
  hidden: { opacity: 0, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.18, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    filter: "blur(3px)",
    transition: { duration: 0.18, ease: EASE_OUT },
  },
};

const OVERFLOW_ACTION_VARIANTS: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      opacity: { duration: 0.18, ease: EASE_OUT },
      filter: { duration: 0.18, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      opacity: { duration: 0.14, ease: EASE_OUT },
      filter: { duration: 0.14, ease: EASE_OUT },
    },
  },
};

const TRACK_SIZE_CLASS: Record<OverflowActionsSize, string> = {
  sm: "gap-1 p-1 text-xs",
  md: "gap-1.5 p-1.5 text-sm",
};

const GROUP_GAP_CLASS: Record<OverflowActionsSize, string> = {
  sm: "gap-1",
  md: "gap-1.5",
};

const ACTION_SIZE_CLASS: Record<OverflowActionsSize, string> = {
  sm: "h-8 min-w-8 gap-1.5 px-3",
  md: "h-9 min-w-9 gap-2 px-3.5",
};

const TOGGLE_SIZE_CLASS: Record<OverflowActionsSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

const ICON_SIZE_CLASS: Record<OverflowActionsSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

function useControllableExpanded({
  expanded,
  defaultExpanded,
  onExpandedChange,
}: {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const [internalExpanded, setInternalExpanded] = useState(
    defaultExpanded ?? false,
  );
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

export function OverflowActions({
  primaryActions,
  overflowActions,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  onAction,
  collapseOnAction = false,
  size = "md",
  openLabel = "Show extra actions",
  closeLabel = "Hide extra actions",
  className,
  classNames,
}: OverflowActionsProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const overflowId = useId();
  const overflowWrapperRef = useRef<HTMLDivElement>(null);
  const overflowWrapperStartRef = useRef(0);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useControllableExpanded({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });

  const transition = reduce ? { duration: 0 } : SHELL_TRANSITION;

  useLayoutEffect(() => {
    const overflowNode = overflowWrapperRef.current;
    if (!overflowNode) return;

    const rect = overflowNode.getBoundingClientRect();
    const rtl = getComputedStyle(overflowNode).direction === "rtl";
    const start = rtl ? rect.right : rect.left;

    if (!isExpanded) {
      overflowNode.style.insetInlineStart = `${
        overflowWrapperStartRef.current - start
      }px`;
      return;
    }

    overflowNode.style.insetInlineStart = "";
    overflowWrapperStartRef.current = start;
  }, [isExpanded]);

  const handleAction = (item: OverflowActionItem) => {
    item.onClick?.();
    onAction?.(item);
    if (collapseOnAction) setIsExpanded(false);
  };

  return (
    <motion.div
      layout
      transition={transition}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !isExpanded) return;
        event.preventDefault();
        setIsExpanded(false);
        toggleRef.current?.focus();
      }}
      className={cn("inline-flex", classNames?.root, className)}
    >
      <motion.div
        layout
        transition={transition}
        className={cn(
          "relative inline-flex items-center overflow-hidden rounded-full border border-border bg-card",
          TRACK_SIZE_CLASS[size],
          classNames?.track,
        )}
      >
        <motion.div
          layout
          transition={transition}
          className={cn("inline-flex items-center", GROUP_GAP_CLASS[size])}
        >
          {primaryActions.map((item) => (
            <ActionButton
              key={item.id}
              item={item}
              size={size}
              reduce={reduce}
              canHover={canHover}
              onAction={handleAction}
              layoutTransition={transition}
              className={cn(classNames?.action, classNames?.primaryAction)}
              iconClassName={classNames?.icon}
              labelClassName={classNames?.label}
            />
          ))}
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          {isExpanded ? (
            <motion.div
              key="overflow-actions"
              ref={overflowWrapperRef}
              id={overflowId}
              layout
              aria-hidden={!isExpanded}
              transition={transition}
              className={cn(
                "relative inline-flex w-max items-center",
                GROUP_GAP_CLASS[size],
              )}
            >
              {overflowActions.map((item) => (
                <ActionButton
                  key={item.id}
                  item={item}
                  size={size}
                  reduce={reduce}
                  canHover={canHover}
                  overflow
                  visible={isExpanded}
                  variants={OVERFLOW_ACTION_VARIANTS}
                  onAction={handleAction}
                  layoutTransition={transition}
                  className={cn(classNames?.action, classNames?.overflowAction)}
                  iconClassName={classNames?.icon}
                  labelClassName={classNames?.label}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          ref={toggleRef}
          type="button"
          layout
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? overflowId : undefined}
          aria-label={isExpanded ? closeLabel : openLabel}
          title={isExpanded ? closeLabel : openLabel}
          onClick={() => setIsExpanded(!isExpanded)}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          whileHover={reduce || !canHover ? undefined : { scale: 1.03 }}
          transition={transition}
          className={cn(
            "relative inline-grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground outline-none disabled:pointer-events-none disabled:opacity-50",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            TOGGLE_SIZE_CLASS[size],
            classNames?.toggle,
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={isExpanded ? "close" : "open"}
              variants={ICON_VARIANTS}
              initial={reduce ? { opacity: 0 } : "hidden"}
              animate={reduce ? { opacity: 1 } : "visible"}
              exit={reduce ? { opacity: 0 } : "exit"}
              className="inline-grid place-items-center"
            >
              {isExpanded ? (
                <X className={ICON_SIZE_CLASS[size]} />
              ) : (
                <MoreHorizontal className={ICON_SIZE_CLASS[size]} />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function ActionButton({
  item,
  size,
  reduce,
  canHover,
  overflow,
  visible = true,
  variants,
  onAction,
  layoutTransition,
  className,
  iconClassName,
  labelClassName,
}: {
  item: OverflowActionItem;
  size: OverflowActionsSize;
  reduce: boolean | null;
  canHover: boolean;
  overflow?: boolean;
  visible?: boolean;
  variants?: Variants;
  onAction: (item: OverflowActionItem) => void;
  layoutTransition: Transition;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
}) {
  const label = typeof item.label === "string" ? item.label : undefined;

  return (
    <motion.span
      layout="position"
      variants={variants}
      initial={variants ? (reduce ? { opacity: 0 } : "hidden") : undefined}
      animate={variants ? (reduce ? { opacity: 1 } : "visible") : undefined}
      exit={variants ? (reduce ? { opacity: 0 } : "exit") : undefined}
      whileTap={reduce || item.disabled ? undefined : { scale: 0.97 }}
      whileHover={
        reduce || !canHover || item.disabled ? undefined : { scale: 1.008 }
      }
      transition={layoutTransition}
      className="inline-flex shrink-0"
    >
      <button
        type="button"
        disabled={item.disabled}
        aria-label={item.ariaLabel ?? label}
        tabIndex={overflow && !visible ? -1 : undefined}
        title={label}
        onClick={() => onAction(item)}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-background font-medium text-foreground outline-none",
          "disabled:pointer-events-none disabled:opacity-45",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          ACTION_SIZE_CLASS[size],
          className,
        )}
      >
        {item.icon ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center justify-center",
              ICON_SIZE_CLASS[size],
              iconClassName,
            )}
          >
            {item.icon}
          </span>
        ) : null}
        <span className={cn("whitespace-nowrap", labelClassName)}>
          {item.label}
        </span>
      </button>
    </motion.span>
  );
}
