"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { spring, exitFallbackMs } from "../lib/springs";
import { fontWeights } from "../lib/font-weight";
import { useShape } from "../lib/shape-context";

// ---------------------------------------------------------------------------
// Portal container context
// ---------------------------------------------------------------------------

const TooltipPortalContainerContext = createContext<HTMLElement | null>(null);

function TooltipPortalContainer({
  value,
  children,
}: {
  value: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <TooltipPortalContainerContext.Provider value={value}>
      {children}
    </TooltipPortalContainerContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

const DEFAULT_DELAY = 200;

// Tracks whether an app-level <TooltipProvider> is above us. Each Tooltip
// only wraps itself in a local primitive Provider when there isn't one —
// a per-instance Provider would defeat cross-tooltip skip-delay grouping
// (moving between adjacent tooltips would re-wait the full delay). Radix's
// Root throws without a Provider, so the local fallback can't be dropped.
const TooltipGroupContext = createContext(false);

interface TooltipProviderProps {
  children: ReactNode;
  /** Hover delay before tooltips open, in ms. Defaults to 200. */
  delayDuration?: number;
  /** After a tooltip closes, adjacent tooltips opened within this window
   *  skip the hover delay, in ms. Defaults to 300. */
  skipDelayDuration?: number;
}

/** Groups descendant Tooltips so that once one opens, moving to an adjacent
 *  trigger shows its tooltip instantly instead of re-waiting the full delay.
 *  Wrap once at the app (or section) level; bare Tooltips still work without
 *  it via a per-instance fallback. */
function TooltipProvider({
  children,
  delayDuration = DEFAULT_DELAY,
  skipDelayDuration = 300,
}: TooltipProviderProps) {
  return (
    <TooltipGroupContext.Provider value={true}>
      <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
      >
        {children}
      </TooltipPrimitive.Provider>
    </TooltipGroupContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TooltipSide = "top" | "right" | "bottom" | "left";

interface TooltipProps {
  content: ReactNode;
  children: React.ReactElement;
  side?: TooltipSide;
  sideOffset?: number;
  /** Hover delay before this tooltip opens, in ms. Defaults to 200, or to the
   *  ambient TooltipProvider's delayDuration when one is present. */
  delayDuration?: number;
  className?: string;
  /** When true, forces the tooltip open. When false, forces it closed. When undefined, uses default hover/focus behavior. */
  forceOpen?: boolean;
  /** Called when the tooltip's internal open state changes (before forceOpen is applied). */
  onOpenChange?: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

function getSlideOffset(side: TooltipSide) {
  switch (side) {
    case "top":
      return { y: 4 };
    case "bottom":
      return { y: -4 };
    case "left":
      return { x: 4 };
    case "right":
      return { x: -4 };
  }
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function Tooltip({
  content,
  children,
  side = "top",
  sideOffset = 8,
  delayDuration,
  className,
  forceOpen,
  onOpenChange: onOpenChangeProp,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = forceOpen !== undefined ? forceOpen : internalOpen;
  const [mounted, setMounted] = useState(false);
  const shape = useShape();
  const portalContainer = useContext(TooltipPortalContainerContext);
  const hasAmbientProvider = useContext(TooltipGroupContext);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Fallback release for the deferred unmount: onAnimationComplete is the
  // primary signal, but rAF-driven animation callbacks can stall in
  // throttled/background tabs. The exit tween runs at spring.fast.exit, so
  // the fallback tracks that tier.
  useEffect(() => {
    if (open) return;
    const id = setTimeout(() => setMounted(false), exitFallbackMs(spring.fast));
    return () => clearTimeout(id);
  }, [open]);

  const handleExitComplete = () => {
    if (!open) setMounted(false);
  };

  const slideOffset = getSlideOffset(side);

  // An explicit delayDuration overrides the ambient provider's delay; left
  // undefined, the Root inherits it from the nearest provider.
  const tooltip = (
    <TooltipPrimitive.Root delayDuration={delayDuration} open={open} onOpenChange={(v) => { setInternalOpen(v); onOpenChangeProp?.(v); }}>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      {mounted && (
        <TooltipPrimitive.Portal forceMount container={portalContainer ?? undefined}>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            forceMount
            className="z-50"
          >
            <motion.div
              className={cn(
                // Trim recenters the label; the padding bump only applies
                // where text-box is supported, keeping the same overall
                // height (~26px) as untrimmed browsers.
                "bg-foreground text-background text-[12px] px-2 py-1",
                "[text-box:trim-both_cap_alphabetic] supports-[text-box:trim-both]:py-2",
                shape.bg,
                className
              )}
              style={{ fontVariationSettings: fontWeights.medium }}
              initial={{ opacity: 0, ...slideOffset }}
              animate={{
                opacity: open ? 1 : 0,
                x: 0,
                y: 0,
              }}
              transition={open ? spring.fast : spring.fast.exit}
              onAnimationComplete={handleExitComplete}
            >
              {content}
            </motion.div>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      )}
    </TooltipPrimitive.Root>
  );

  // Fallback: Radix's Root requires a Provider above it, so without an
  // ambient TooltipProvider each instance carries its own with the library's
  // default delay. Grouped skip-delay needs the shared app-level
  // TooltipProvider.
  if (hasAmbientProvider) return tooltip;

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration ?? DEFAULT_DELAY}>
      {tooltip}
    </TooltipPrimitive.Provider>
  );
}

export { Tooltip, TooltipPortalContainer, TooltipProvider };
export type { TooltipProps, TooltipProviderProps, TooltipSide };
