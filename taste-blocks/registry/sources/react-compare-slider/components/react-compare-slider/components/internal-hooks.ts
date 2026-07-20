'use client';

import { useEffect, useRef } from 'react';

export const EVENT_PASSIVE_PARAMS = { capture: false, passive: true };
export const EVENT_CAPTURE_PARAMS = { capture: true, passive: false };

/** Keyboard `key` events to trigger slider movement. */
export enum KeyboardEventKeys {
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
}

/**
 * Event listener binding hook.
 * @param eventName        Event to bind to.
 * @param handler          Callback handler.
 * @param element          Element to bind to.
 * @param handlerOptions  Event handler options.
 */
export const useEventListener = (
  eventName: EventListener['name'],
  handler: EventListener['caller'],
  element: EventTarget | undefined | null,
  handlerOptions: AddEventListenerOptions,
): void => {
  const savedHandler = useRef<EventListener['caller']>(undefined);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Make sure element supports addEventListener.
    if (!element?.addEventListener) return;

    // Create event listener that calls handler function stored in ref.
    const eventListener: EventListener = (event) => savedHandler.current?.(event);

    element.addEventListener(eventName, eventListener, handlerOptions);

    return (): void => {
      element.removeEventListener(eventName, eventListener, handlerOptions);
    };
  }, [eventName, element, handlerOptions]);
};
