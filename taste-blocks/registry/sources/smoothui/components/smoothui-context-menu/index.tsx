"use client";

import {
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenu as ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./context-menu-primitive";
import { cn } from "./utils";
import { motion, useReducedMotion } from "motion/react";
import type React from "react";
import { SPRING_DEFAULT } from "./animation";

export interface ContextMenuProps {
  /** The trigger element that opens the context menu on right-click */
  children: React.ReactNode;
  /** Optional CSS class for the content container */
  className?: string;
  /** Menu items to render */
  items: ContextMenuItemConfig[];
}

export interface ContextMenuItemConfig {
  /** Nested submenu items */
  children?: ContextMenuItemConfig[];
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Renders a group label instead of an item */
  groupLabel?: string;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Unique key for the item */
  key: string;
  /** Display label */
  label: string;
  /** Callback when item is selected */
  onSelect?: () => void;
  /** Renders a separator instead of an item */
  separator?: boolean;
  /** Optional keyboard shortcut text to display */
  shortcut?: string;
  /** Destructive variant styling */
  variant?: "default" | "destructive";
}

export default function ContextMenu({
  children,
  items,
  className,
}: ContextMenuProps) {
  const shouldReduceMotion = useReducedMotion();

  const renderItem = (item: ContextMenuItemConfig, index: number) => {
    if (item.separator) {
      return <ContextMenuSeparator key={item.key} />;
    }

    if (item.groupLabel) {
      return (
        <ContextMenuLabel key={item.key}>{item.groupLabel}</ContextMenuLabel>
      );
    }

    if (item.children && item.children.length > 0) {
      return (
        <ContextMenuSub key={item.key}>
          <ContextMenuSubTrigger disabled={item.disabled}>
            {item.icon && <span className="me-2">{item.icon}</span>}
            {item.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {item.children.map((child, childIndex) =>
              renderItem(child, childIndex)
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }

    return (
      <motion.div
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
        key={item.key}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { ...SPRING_DEFAULT, delay: index * 0.02 }
        }
      >
        <ContextMenuItem
          disabled={item.disabled || !item.onSelect}
          onSelect={item.onSelect}
          variant={item.variant}
        >
          {item.icon && <span className="me-2">{item.icon}</span>}
          {item.label}
          {item.shortcut && (
            <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>
          )}
        </ContextMenuItem>
      </motion.div>
    );
  };

  return (
    <ContextMenuRoot>
      <ContextMenuTrigger asChild tabIndex={0}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className={cn("origin-top", className)}>
        <motion.div
          animate={
            shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
          }
          initial={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 0.95, y: -4 }
          }
          transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
        >
          <ContextMenuGroup>
            {items.map((item, index) => renderItem(item, index))}
          </ContextMenuGroup>
        </motion.div>
      </ContextMenuContent>
    </ContextMenuRoot>
  );
}
