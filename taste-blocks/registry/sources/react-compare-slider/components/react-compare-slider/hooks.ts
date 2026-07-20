'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { KeyboardEventKeys } from './components/internal-hooks';
import { ReactCompareSliderClip, ReactCompareSliderCssVars } from './consts';
import { register } from './register';
import type {
  SetPositionFromBoundsProps,
  UseReactCompareSliderProps,
  UseReactCompareSliderReturn,
} from './types';

register();

const DEFAULT_TRANSITION = '0.15s ease-out';

const getDefaultOnlyHandleDraggable = () => !!globalThis.matchMedia?.('(pointer: coarse)')?.matches;

/**
 * Hook to completely control the slider including all event handlers and state.
 * This is automatically used by the `ReactCompareSlider` component.
 * Only use this if you are building your own slider using the `react-compare-slider/components` module.
 */
export const useReactCompareSlider = ({
  boundsPadding = '0px',
  browsingContext = globalThis,
  changePositionOnHover = false,
  clip = ReactCompareSliderClip.all,
  defaultPosition = 50,
  disabled = false,
  keyboardIncrement = '5%',
  onlyHandleDraggable = getDefaultOnlyHandleDraggable(),
  onPositionChange,
  portrait = false,
  transition: transitionProp,
}: UseReactCompareSliderProps = {}): UseReactCompareSliderReturn => {
  /** DOM node of the root element. */
  const rootRef = useRef<HTMLDivElement>(null);
  /** DOM node of the handle container. */
  const handleRootRef = useRef<HTMLDivElement>(null);
  /** Current position as a percentage value. */
  const position = useRef(defaultPosition);
  /** Whether user is currently dragging. */
  const [isDragging, setIsDragging] = useState(false);
  /** Whether the `transition` property can be applied. */
  const [canTransition, setCanTransition] = useState(true);
  /** Target container for pointer events. */
  const [interactiveTarget, setInteractiveTarget] = useState<HTMLElement | null>(null);
  /** Motion-safe default that can update after server rendering and when user preference changes. */
  const [defaultTransition, setDefaultTransition] = useState('none');
  const transition = transitionProp ?? defaultTransition;

  useEffect(() => {
    const media = globalThis.matchMedia?.('(prefers-reduced-motion: no-preference)');
    if (!media) return;

    const syncTransition = () => setDefaultTransition(media.matches ? DEFAULT_TRANSITION : 'none');
    syncTransition();
    media.addEventListener('change', syncTransition);

    return () => media.removeEventListener('change', syncTransition);
  }, []);

  const setPosition = useCallback(
    (nextPosition: number) => {
      const appliedPosition = Math.min(Math.max(nextPosition, 0), 100);

      rootRef.current?.style.setProperty(ReactCompareSliderCssVars.rawPosition, `${appliedPosition}%`);
      handleRootRef.current?.setAttribute('aria-valuenow', `${Math.round(appliedPosition)}`);
      position.current = appliedPosition;

      onPositionChange?.(appliedPosition);
    },
    [onPositionChange],
  );

  /** Set position using pointer coords. */
  const setPositionFromBounds = useCallback(
    function updateInternal({ x, y }: SetPositionFromBoundsProps) {
      const rootElement = rootRef.current as HTMLDivElement;
      const { width, height, top, left } = rootElement.getBoundingClientRect();

      // Early out when component has zero bounds.
      if (width === 0 || height === 0) return;

      const pixelPosition = portrait ? y - top - browsingContext.scrollY : x - left - browsingContext.scrollX;
      const nextPosition = (pixelPosition / (portrait ? height : width)) * 100;
      setPosition(nextPosition);
    },
    [browsingContext, portrait, setPosition],
  );

  /** Handle mouse/touch down. */
  const onPointerDown = useCallback(
    (ev: PointerEvent) => {
      ev.preventDefault();

      // Only handle left mouse button (touch events also use 0).
      if (disabled || ev.button !== 0) return;

      setPositionFromBounds({ x: ev.pageX, y: ev.pageY });
      setIsDragging(true);
      setCanTransition(true);
    },
    [disabled, setPositionFromBounds],
  );

  /** Handle mouse/touch move. */
  const onPointerMove = useCallback(
    function moveCall(ev: PointerEvent) {
      setCanTransition(false);
      setPositionFromBounds({ x: ev.pageX, y: ev.pageY });
    },
    [setPositionFromBounds],
  );

  /** Handle mouse/touch up. */
  const onPointerUp = useCallback((_ev: PointerEvent) => {
    setIsDragging(false);
    setCanTransition(true);
  }, []);

  const onTouchEnd = useCallback((_ev: TouchEvent) => {
    setIsDragging(false);
    setCanTransition(true);
  }, []);

  const onHandleRootClick = useCallback(
    (ev: PointerEvent) => {
      ev.preventDefault();
      if (disabled) return;
      (ev.currentTarget as HTMLDivElement)?.focus();
    },
    [disabled],
  );

  /** Handle keyboard movment. */
  const onHandleRootKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (disabled || !Object.values(KeyboardEventKeys).includes(ev.key as KeyboardEventKeys)) {
        return;
      }

      ev.preventDefault();
      setCanTransition(true);

      const incrementPercentage =
        typeof keyboardIncrement === 'string'
          ? Number.parseFloat(keyboardIncrement)
          : (keyboardIncrement / (rootRef.current?.getBoundingClientRect().width as number)) * 100;

      const isIncrement = portrait
        ? ev.key === KeyboardEventKeys.ARROW_LEFT || ev.key === KeyboardEventKeys.ARROW_DOWN
        : ev.key === KeyboardEventKeys.ARROW_RIGHT || ev.key === KeyboardEventKeys.ARROW_UP;

      const nextPosition = isIncrement
        ? position.current + incrementPercentage
        : position.current - incrementPercentage;

      setPosition(nextPosition);
    },
    [disabled, keyboardIncrement, portrait, setPosition],
  );

  // Set target container for pointer events.
  useLayoutEffect(() => {
    setInteractiveTarget(onlyHandleDraggable ? handleRootRef.current : rootRef.current);
  }, [onlyHandleDraggable]);

  // Resync position when defaultPosition changes.
  useEffect(() => {
    setPosition(defaultPosition);
  }, [defaultPosition, setPosition]);

  return {
    // Direct props
    boundsPadding,
    browsingContext,
    changePositionOnHover,
    clip,
    defaultPosition,
    disabled,
    keyboardIncrement,
    onlyHandleDraggable,
    portrait,
    transition,
    // Events
    onHandleRootKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onTouchEnd,
    onHandleRootClick,
    // State
    canTransition,
    isDragging,
    position,
    // Setters
    setPosition,
    setPositionFromBounds,
    // Elements
    rootRef,
    handleRootRef,
    interactiveTarget,
  };
};
