import type { ComponentProps, ReactNode, RefObject } from 'react';

import type { ReactCompareSliderClipValue } from './consts';

/** Slider position property. */
export type ReactCompareSliderPosition = number;

/** Common props shared between components. */
export type ReactCompareSliderCommonProps = {
  /**
   * Divider position.
   * @default 50
   */
  defaultPosition?: ReactCompareSliderPosition;

  /**
   * Whether to disable slider movement (items are still interactable).
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to use portrait (vertical) orientation.
   * @default false
   */
  portrait?: boolean;

  /**
   * Shorthand CSS `transition` property to apply to handle movement. The specific CSS property
   * to transition **must not** be provided.
   * @example '.5s ease-in-out'
   */
  transition?: string;
};

/** Props for the pre-built `ReactCompareSlider` component. */
export type ReactCompareSliderProps = ReactCompareSliderCommonProps & {
  /**
   * CSS unit amount to limit the slideable bounds on the X-axis (landscape) or Y-axis (portrait).
   * @example '20rem'
   * @default '0px'
   */
  boundsPadding?: string;

  /**
   * Custom browsing context to use instead of the global `window` object.
   * @default globalThis
   */
  browsingContext?: typeof globalThis | Window | WindowProxy;

  /**
   * Whether the slider should follow the pointer on hover.
   * @default false
   */
  changePositionOnHover?: boolean;

  /**
   * Whether to clip `itemOne`, `itemTwo` or `all` items.
   * @default all
   */
  clip?: ReactCompareSliderClipValue;

  /** Custom handle component. */
  handle?: ReactNode;

  /** First item to show. */
  itemOne: ReactNode;

  /** Second item to show. */
  itemTwo: ReactNode;

  /**
   * Percentage or pixel amount to move when the slider handle is focused and keyboard arrow is pressed.
   * @default '5%'
   */
  keyboardIncrement?: number | `${number}%`;

  /**
   * Whether to only change position when handle is interacted with (useful for touch devices).
   * @default false
   */
  onlyHandleDraggable?: boolean;

  /** Callback on position change with position as percentage. */
  onPositionChange?: (position: ReactCompareSliderPosition) => void;
};

/** `ReactCompareSliderProps` and all valid `div` element props. */
export type ReactCompareSliderDetailedProps = ReactCompareSliderProps &
  Omit<ComponentProps<'div'>, 'children'>;

export type UseReactCompareSliderProps = Omit<ReactCompareSliderProps, 'handle' | 'itemOne' | 'itemTwo'>;

export type SetPositionFromBoundsProps = {
  /** X coordinate to update to (landscape). */
  x: number;
  /** Y coordinate to update to (portrait). */
  y: number;
};

export type UseReactCompareSliderReturn = Required<
  Pick<
    ReactCompareSliderProps,
    | 'boundsPadding'
    | 'browsingContext'
    | 'changePositionOnHover'
    | 'clip'
    | 'defaultPosition'
    | 'disabled'
    | 'keyboardIncrement'
    | 'onlyHandleDraggable'
    | 'portrait'
  >
> &
  Pick<ReactCompareSliderProps, 'transition'> & {
    // Events
    /** Handler fired on the `interactiveTarget` `pointerdown` event. */
    onPointerDown: (event: PointerEvent) => void;
    /** Handler fired on the `rootRef` `pointermove` event when the user `isDragging`. */
    onPointerMove: (event: PointerEvent) => void;
    /** Handler fired on the `interactiveTarget` `pointerup` event. */
    onPointerUp: (event: PointerEvent) => void;
    /** Handler fired on the `interactiveTarget` `touchend` event. */
    onTouchEnd: (event: TouchEvent) => void;
    /** Handler fired on the `handleRootRef` `click` event. */
    onHandleRootClick: (event: PointerEvent) => void;
    /** Handler fired on the `handleRootRef` `keydown` event when the element is focused. */
    onHandleRootKeyDown: (event: KeyboardEvent) => void;
    // State
    /** Whether the `transition` property should be applied. */
    canTransition: boolean;
    /** Whether the user is currently dragging the slider. */
    isDragging: boolean;
    /** Ref with the current position. */
    position: RefObject<ReactCompareSliderPosition>;
    // Setters
    /** Set the position directly as a percentage. */
    setPosition: (nextPosition: number) => void;
    /** Set the position from the coords of an event. */
    setPositionFromBounds: (props: SetPositionFromBoundsProps) => void;
    // Elements
    /** Root element. */
    rootRef: RefObject<HTMLDivElement | null>;
    /** The direct parent element of the `handle` component. */
    handleRootRef: RefObject<HTMLDivElement | null>;
    /**
     * The target element for pointer events.
     * This defaults to the `rootRef` element and switches to the `handleRootRef` element when `onlyHandleDraggable` is `true`.
     */
    interactiveTarget: HTMLElement | null;
  };
