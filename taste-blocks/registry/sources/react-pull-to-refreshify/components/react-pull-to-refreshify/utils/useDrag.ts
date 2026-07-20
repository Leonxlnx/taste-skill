import { useEffect, useRef } from "react";

import { Events } from "./events";
import { useLatest } from "./useLatest";

export interface DragState {
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

const initialDragState: DragState = {
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
};

export type DragEvent = globalThis.MouseEvent | TouchEvent;

function isMouseEvent(event: DragEvent): event is globalThis.MouseEvent {
  return !("touches" in event);
}

export const useDrag = ({
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
}: {
  onDragStart?: (event: DragEvent, dragState: DragState) => void;
  onDragMove?: (event: DragEvent, dragState: DragState) => boolean;
  onDragEnd?: (event: DragEvent, dragState: DragState) => void;
  onDragCancel?: (event: Event, dragState: DragState) => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const onDragStartRef = useLatest(onDragStart);
  const onDragMoveRef = useLatest(onDragMove);
  const onDragEndRef = useLatest(onDragEnd);
  const onDragCancelRef = useLatest(onDragCancel);

  useEffect(() => {
    const dragEl = ref.current;

    if (!dragEl || typeof window === "undefined") return;

    let dragState: DragState = { ...initialDragState };
    let isStart = false;

    const initDragState = () => {
      dragState = { ...initialDragState };
    };

    const handleDragStart = ((event: DragEvent) => {
      if (isMouseEvent(event)) {
        if (event.button !== 0) return;
      } else if (event.touches.length !== 1) {
        return;
      }

      isStart = true;
      initDragState();
      if (isMouseEvent(event)) {
        dragState.startX = event.clientX;
        dragState.startY = event.clientY;
      } else {
        const [touch] = event.touches;
        dragState.startX = touch.pageX;
        dragState.startY = touch.pageY;
      }
      onDragStartRef.current?.(event, dragState);
    }) as EventListener;

    const handleDragMove = ((event: DragEvent) => {
      if (!isStart) return;

      let currentX = 0;
      let currentY = 0;

      if (isMouseEvent(event)) {
        currentX = event.clientX;
        currentY = event.clientY;
      } else {
        const [touch] = event.touches;
        if (!touch) return;
        currentX = touch.pageX;
        currentY = touch.pageY;
      }

      const state = {
        ...dragState,
        offsetX: currentX - dragState.startX,
        offsetY: currentY - dragState.startY,
      };

      if (onDragMoveRef.current?.(event, state)) {
        dragState = state;
      }
    }) as EventListener;

    const handleDragEnd = ((event: DragEvent) => {
      if (!isStart) return;
      isStart = false;
      onDragEndRef.current?.(event, dragState);
      initDragState();
    }) as EventListener;

    const handleDragCancel = ((event: Event) => {
      if (!isStart) return;
      isStart = false;
      onDragCancelRef.current?.(event, dragState);
      initDragState();
    }) as EventListener;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleDragCancel(new Event("visibilitychange"));
      }
    };

    Events.on(dragEl, "touchstart", handleDragStart);
    Events.on(dragEl, "touchmove", handleDragMove);
    Events.on(dragEl, "touchend", handleDragEnd);
    Events.on(dragEl, "touchcancel", handleDragCancel);
    Events.on(dragEl, "mousedown", handleDragStart);
    Events.on(window, "mousemove", handleDragMove);
    Events.on(window, "mouseup", handleDragEnd);
    Events.on(window, "pointercancel", handleDragCancel);
    Events.on(window, "blur", handleDragCancel);
    Events.on(document, "visibilitychange", handleVisibilityChange);

    return () => {
      Events.off(dragEl, "touchstart", handleDragStart);
      Events.off(dragEl, "touchmove", handleDragMove);
      Events.off(dragEl, "touchend", handleDragEnd);
      Events.off(dragEl, "touchcancel", handleDragCancel);
      Events.off(dragEl, "mousedown", handleDragStart);
      Events.off(window, "mousemove", handleDragMove);
      Events.off(window, "mouseup", handleDragEnd);
      Events.off(window, "pointercancel", handleDragCancel);
      Events.off(window, "blur", handleDragCancel);
      Events.off(document, "visibilitychange", handleVisibilityChange);
    };
  }, [onDragCancelRef, onDragEndRef, onDragMoveRef, onDragStartRef]);

  return ref;
};
