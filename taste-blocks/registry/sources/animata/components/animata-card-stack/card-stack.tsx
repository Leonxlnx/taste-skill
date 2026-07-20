"use client";

import type { HTMLMotionProps, Transition } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import {
  type ComponentProps,
  cloneElement,
  createContext,
  isValidElement,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion";
import { cn } from "../../lib/utils";

export interface CardStackItem {
  id: string;
}

export interface CardStackLayerMotion {
  className: string;
  initial: HTMLMotionProps<"div">["initial"];
  animate: HTMLMotionProps<"div">["animate"];
  exit?: HTMLMotionProps<"div">["exit"];
  transition: Transition;
  style?: HTMLMotionProps<"div">["style"];
}

const DEFAULT_STACK_DEPTH = 3;
const DEFAULT_AUTOPLAY_INTERVAL = 4500;
/** How long before the next click is accepted — decoupled from exit spring settle */
const STEP_COOLDOWN_MS = 260;

/** Peek offsets as % of each card’s height so stacks scale with card size */
const STACK_LAYER_PRESETS = [
  { y: "0%", scale: 1, rotate: 0, zIndex: 20 },
  { y: "-5%", scale: 0.84, rotate: -1, zIndex: 5 },
  { y: "-7.5%", scale: 0.72, rotate: 1, zIndex: 0 },
] as const;

const PROMOTE_SPRING: Transition = {
  type: "spring",
  visualDuration: 0.22,
  bounce: 0,
};

/** Top-card press — same transform channel as stack promote / throw */
const PRESS_SPRING: Transition = {
  type: "spring",
  visualDuration: 0.1,
  bounce: 0,
};

const PRESS_SCALE_FACTOR = 0.985;

const THROW_SPRING: Transition = {
  type: "spring",
  visualDuration: 0.24,
  bounce: 0.06,
  restSpeed: 2,
  restDelta: 0.001,
};

export interface CardStackThrowImpulse {
  x: string;
  rotate: number;
  yVelocity: number;
  rotateVelocity: number;
}

export function createCardStackThrowImpulse(): CardStackThrowImpulse {
  const drift = Math.random() - 0.5;

  return {
    x: `${(drift * 7).toFixed(2)}%`,
    rotate: drift * 6 + (Math.random() - 0.5) * 1.5,
    yVelocity: 3.5 + Math.random() * 2.8,
    rotateVelocity: drift * 10,
  };
}

const CARD_STACK_STACK_ORIGIN = "50% 0%";
const CARD_STACK_EXIT_Y = "200%";

export function getCardStackLayers(
  reducedMotion: boolean,
  depth = DEFAULT_STACK_DEPTH,
): CardStackLayerMotion[] {
  const stackTransition: Transition = reducedMotion ? { duration: 0 } : PROMOTE_SPRING;

  const layers: CardStackLayerMotion[] = STACK_LAYER_PRESETS.map((preset) => ({
    className: "",
    initial: {
      y: preset.y,
      rotate: preset.rotate,
      scale: preset.scale,
      opacity: 1,
      zIndex: preset.zIndex,
    },
    animate: {
      y: preset.y,
      rotate: preset.rotate,
      scale: preset.scale,
      opacity: 1,
      zIndex: preset.zIndex,
    },
    exit: reducedMotion
      ? {
          y: preset.y,
          scale: preset.scale,
          opacity: 1,
          zIndex: preset.zIndex,
        }
      : {
          y: CARD_STACK_EXIT_Y,
          rotate: 0,
          scale: 0.93,
          opacity: 0,
          zIndex: 30,
        },
    transition: stackTransition,
    style: { transformOrigin: CARD_STACK_STACK_ORIGIN },
  }));

  return layers.slice(0, depth);
}

function getLayerScale(layer: CardStackLayerMotion): number {
  const target = layer.animate;
  if (
    target &&
    typeof target === "object" &&
    "scale" in target &&
    typeof target.scale === "number"
  ) {
    return target.scale;
  }
  return 1;
}

function getCardStackInitial(
  stackIndex: number,
  depth: number,
  layer: CardStackLayerMotion,
): HTMLMotionProps<"div">["initial"] {
  if (stackIndex !== 0 && stackIndex !== depth - 1) {
    return false;
  }

  return layer.initial;
}

function getCardStackExit(
  stackIndex: number,
  layer: CardStackLayerMotion,
  reducedMotion: boolean,
  throwImpulse: CardStackThrowImpulse | null,
): HTMLMotionProps<"div">["exit"] {
  if (stackIndex !== 0) {
    return undefined;
  }

  if (reducedMotion) {
    return layer.exit;
  }

  const impulse = throwImpulse ?? createCardStackThrowImpulse();

  return {
    y: CARD_STACK_EXIT_Y,
    x: impulse.x,
    rotate: impulse.rotate,
    scale: 0.9,
    opacity: 0,
    zIndex: 30,
    transition: {
      y: { ...THROW_SPRING, velocity: impulse.yVelocity * 0.4 },
      x: THROW_SPRING,
      rotate: { ...THROW_SPRING, velocity: impulse.rotateVelocity * 0.35 },
      scale: THROW_SPRING,
      opacity: { type: "tween", duration: 0.16, ease: [0.4, 0, 1, 1] },
    },
  };
}

interface CardStackContextValue<T extends CardStackItem = CardStackItem> {
  items: T[];
  visibleItems: T[];
  activeItem: T | undefined;
  depth: number;
  isAnimating: boolean;
  pressActive: boolean;
  setPressActive: (active: boolean) => void;
  throwImpulse: CardStackThrowImpulse | null;
  advance: () => void;
  handleExitComplete: () => void;
  reducedMotion: boolean;
  layers: CardStackLayerMotion[];
}

const CardStackContext = createContext<CardStackContextValue | null>(null);

export function useCardStack<T extends CardStackItem = CardStackItem>() {
  const context = use(CardStackContext);
  if (!context) {
    throw new Error("CardStack primitives must be used within <CardStack>.");
  }
  return context as CardStackContextValue<T>;
}

interface CardStackRootProps<T extends CardStackItem> {
  items: T[];
  depth?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  onItemsChange?: (items: T[]) => void;
  children: ReactNode;
}

function CardStackRoot<T extends CardStackItem>({
  items,
  depth = DEFAULT_STACK_DEPTH,
  autoplay = false,
  autoplayInterval = DEFAULT_AUTOPLAY_INTERVAL,
  onItemsChange,
  children,
}: CardStackRootProps<T>) {
  const reducedMotion = usePrefersReducedMotion();
  const stackDepth = Math.min(Math.max(1, depth), STACK_LAYER_PRESETS.length);
  const layers = useMemo(
    () => getCardStackLayers(reducedMotion, stackDepth),
    [reducedMotion, stackDepth],
  );
  const [itemList, setItemList] = useState<T[]>([]);
  const prevItemsRef = useRef<T[] | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pressActive, setPressActive] = useState(false);
  const [throwImpulse, setThrowImpulse] = useState<CardStackThrowImpulse | null>(null);
  const isAnimatingRef = useRef(false);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceRef = useRef<() => void>(() => {});
  const onItemsChangeRef = useRef(onItemsChange);
  onItemsChangeRef.current = onItemsChange;
  const skipItemsChangeNotifyRef = useRef(false);
  const hasUserRotatedRef = useRef(false);

  const visibleItems = itemList.slice(0, stackDepth);
  const activeItem = visibleItems[0];

  const clearStepTimer = useCallback(() => {
    if (stepTimerRef.current !== null) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current !== null) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  if (items !== prevItemsRef.current) {
    clearStepTimer();
    clearAutoplayTimer();
    isAnimatingRef.current = false;
    setIsAnimating(false);
    skipItemsChangeNotifyRef.current = true;
    prevItemsRef.current = items;
    setItemList(items);
  }

  useEffect(() => {
    if (skipItemsChangeNotifyRef.current) {
      skipItemsChangeNotifyRef.current = false;
      return;
    }
    if (!hasUserRotatedRef.current) return;
    onItemsChangeRef.current?.(itemList as T[]);
  }, [itemList]);

  const rotateOne = useCallback(() => {
    hasUserRotatedRef.current = true;
    setItemList((current) => {
      if (current.length <= 1) return current;
      const next = [...current];
      next.push(next.shift()!);
      return next;
    });
  }, []);

  const finishStep = useCallback(() => {
    clearStepTimer();
    if (!isAnimatingRef.current) return false;
    isAnimatingRef.current = false;
    setIsAnimating(false);
    return true;
  }, [clearStepTimer]);

  const scheduleAutoplay = useCallback(() => {
    clearAutoplayTimer();
    if (!autoplay || reducedMotion || itemList.length <= 1) return;
    if (document.hidden) return;

    autoplayTimerRef.current = setTimeout(() => {
      autoplayTimerRef.current = null;
      advanceRef.current();
    }, autoplayInterval);
  }, [autoplay, autoplayInterval, clearAutoplayTimer, itemList.length, reducedMotion]);

  const finishStepAndScheduleAutoplay = useCallback(() => {
    if (finishStep()) {
      scheduleAutoplay();
    }
  }, [finishStep, scheduleAutoplay]);

  const advance = useCallback(() => {
    if (itemList.length <= 1 || isAnimatingRef.current) return;

    clearAutoplayTimer();

    if (reducedMotion) {
      rotateOne();
      scheduleAutoplay();
      return;
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setThrowImpulse(createCardStackThrowImpulse());
    clearStepTimer();
    rotateOne();
    stepTimerRef.current = setTimeout(finishStepAndScheduleAutoplay, STEP_COOLDOWN_MS);
  }, [
    clearAutoplayTimer,
    clearStepTimer,
    finishStepAndScheduleAutoplay,
    itemList.length,
    reducedMotion,
    rotateOne,
    scheduleAutoplay,
  ]);

  advanceRef.current = advance;

  const handleExitComplete = useCallback(() => {
    finishStepAndScheduleAutoplay();
  }, [finishStepAndScheduleAutoplay]);

  useEffect(() => {
    scheduleAutoplay();
    return () => {
      clearStepTimer();
      clearAutoplayTimer();
    };
  }, [clearAutoplayTimer, clearStepTimer, scheduleAutoplay]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        clearAutoplayTimer();
        return;
      }
      if (!isAnimatingRef.current) {
        scheduleAutoplay();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [clearAutoplayTimer, scheduleAutoplay]);

  const value = useMemo(
    () => ({
      items: itemList,
      visibleItems,
      activeItem,
      depth: stackDepth,
      isAnimating,
      pressActive,
      setPressActive,
      throwImpulse,
      advance,
      handleExitComplete,
      reducedMotion,
      layers,
    }),
    [
      itemList,
      visibleItems,
      activeItem,
      stackDepth,
      isAnimating,
      pressActive,
      throwImpulse,
      advance,
      handleExitComplete,
      reducedMotion,
      layers,
    ],
  );

  return <CardStackContext value={value}>{children}</CardStackContext>;
}

export interface CardStackTriggerProps {
  /** When true, renders an absolute inset-0 overlay for click-anywhere advance. When false (default), renders a real `<button>` for a discrete control. */
  full?: boolean;
  "aria-label"?: string;
  className?: string;
  children?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
}

function useCardStackTriggerHandlers({
  isAnimating,
  setPressActive,
  advance,
  onClick,
  onKeyDown,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: {
  isAnimating: boolean;
  setPressActive: (active: boolean) => void;
  advance: () => void;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void;
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
}) {
  return {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      onPointerDown?.(event);
      if (!event.defaultPrevented && !isAnimating) {
        setPressActive(true);
      }
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      onPointerUp?.(event);
      window.setTimeout(() => setPressActive(false), 0);
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event);
      setPressActive(false);
    },
    onPointerCancel: (event: React.PointerEvent<HTMLElement>) => {
      onPointerCancel?.(event);
      setPressActive(false);
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        advance();
      }
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        advance();
      }
    },
  };
}

function CardStackTrigger({
  full = false,
  "aria-label": ariaLabel = "Show next card",
  className,
  children,
  onClick,
  onKeyDown,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
}: CardStackTriggerProps) {
  const { advance, isAnimating, setPressActive } = useCardStack();
  const handlers = useCardStackTriggerHandlers({
    isAnimating,
    setPressActive,
    advance,
    onClick,
    onKeyDown,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
  });

  if (full) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        {...handlers}
        className={cn(
          "absolute inset-0 z-40 cursor-pointer border-0 bg-transparent p-0 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerDown={handlers.onPointerDown}
      onPointerUp={handlers.onPointerUp}
      onPointerLeave={handlers.onPointerLeave}
      onPointerCancel={handlers.onPointerCancel}
      onClick={handlers.onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {children}
    </button>
  );
}

function CardStackViewport({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("relative w-full overflow-visible", className)} {...props}>
      {children}
    </div>
  );
}

interface CardStackListProps<T extends CardStackItem> {
  children: (item: T, index: number, layer: CardStackLayerMotion) => ReactNode;
}

function CardStackList<T extends CardStackItem>({ children }: CardStackListProps<T>) {
  const { visibleItems, layers, handleExitComplete } = useCardStack<T>();

  return (
    <AnimatePresence initial={false} mode="sync" onExitComplete={handleExitComplete}>
      {visibleItems.map((item, index) => {
        const layer = layers[index]!;
        const node = children(item, index, layer);

        if (isValidElement<CardStackCardProps>(node) && node.type === CardStackCard) {
          return cloneElement<CardStackCardProps>(node, {
            key: item.id,
            stackIndex: index,
            layer,
          });
        }

        return node;
      })}
    </AnimatePresence>
  );
}

interface CardStackCardProps extends HTMLMotionProps<"div"> {
  layer: CardStackLayerMotion;
  stackIndex: number;
  stackDepth?: number;
}

function CardStackCard({
  layer,
  stackIndex,
  stackDepth,
  className,
  style,
  ...props
}: CardStackCardProps) {
  const { depth, isAnimating, pressActive, reducedMotion, throwImpulse } = useCardStack();
  const total = stackDepth ?? depth;

  const initial = getCardStackInitial(stackIndex, depth, layer);
  const exit = getCardStackExit(stackIndex, layer, reducedMotion, throwImpulse);
  const baseScale = getLayerScale(layer);
  const isPressed = stackIndex === 0 && pressActive && !reducedMotion && !isAnimating;
  const animateTarget =
    typeof layer.animate === "object" && layer.animate !== null && !Array.isArray(layer.animate)
      ? layer.animate
      : {};
  const animate = isPressed
    ? { ...animateTarget, scale: baseScale * PRESS_SCALE_FACTOR }
    : layer.animate;
  const transition = isPressed ? PRESS_SPRING : layer.transition;

  return (
    <motion.div
      className={cn(
        "absolute inset-x-0 top-0 w-full will-change-transform motion-reduce:transition-none",
        layer.className,
        className,
      )}
      aria-roledescription={`Card ${stackIndex + 1} of ${total}`}
      style={{
        transformOrigin: CARD_STACK_STACK_ORIGIN,
        ...layer.style,
        ...style,
      }}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      {...props}
    />
  );
}

const CardStack = Object.assign(CardStackRoot, {
  Trigger: CardStackTrigger,
  Viewport: CardStackViewport,
  List: CardStackList,
  Card: CardStackCard,
}) as typeof CardStackRoot & {
  Trigger: typeof CardStackTrigger;
  Viewport: typeof CardStackViewport;
  List: typeof CardStackList;
  Card: typeof CardStackCard;
};

export default CardStack;
export {
  CardStack,
  CardStackCard,
  CardStackList,
  CardStackRoot,
  CardStackTrigger,
  CardStackViewport,
};
