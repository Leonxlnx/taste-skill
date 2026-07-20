import { useEffect, useRef } from "react";

import { Events } from "./events";
import { getScrollTop } from "./getScrollTop";
import type { ScrollParent } from "./getScrollTop";

const getScrollParent = (node: Element | null): ScrollParent | null => {
  if (
    !node ||
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return null;
  }

  let current: Element | null = node;
  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    const computedStyle = window.getComputedStyle(current);
    const canScroll = [computedStyle.overflowY, computedStyle.overflow].some(
      (value) => ["scroll", "auto", "overlay"].includes(value)
    );

    if (canScroll && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }

  return window;
};

export const useScrollParent = (enabled = true) => {
  const pullRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<ScrollParent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    let touchStartX: number | null = null;
    let touchStartY: number | null = null;
    let observedParent: Element | null = null;
    let unbindScrollParentEvents = () => {};

    const bindScrollParentEvents = (scrollParent: ScrollParent) => {
      const handleTouchstart = ((event: TouchEvent) => {
        const [touch] = event.touches;
        if (!touch) return;
        touchStartX = touch.pageX;
        touchStartY = touch.pageY;
      }) as EventListener;

      const handleTouchmove = ((event: TouchEvent) => {
        const [touch] = event.touches;
        if (!touch || touchStartX === null || touchStartY === null) return;

        const deltaX = touch.pageX - touchStartX;
        const deltaY = touch.pageY - touchStartY;
        if (
          deltaY > 0 &&
          Math.abs(deltaY) > Math.abs(deltaX) &&
          event.cancelable &&
          getScrollTop(scrollParent) === 0 &&
          event.target &&
          pullRef.current?.contains(event.target as Node)
        ) {
          event.preventDefault();
        }
      }) as EventListener;

      const handleTouchend = (() => {
        touchStartX = null;
        touchStartY = null;
      }) as EventListener;

      Events.on(scrollParent, "touchstart", handleTouchstart);
      Events.on(scrollParent, "touchmove", handleTouchmove);
      Events.on(scrollParent, "touchend", handleTouchend);
      Events.on(scrollParent, "touchcancel", handleTouchend);

      return () => {
        Events.off(scrollParent, "touchstart", handleTouchstart);
        Events.off(scrollParent, "touchmove", handleTouchmove);
        Events.off(scrollParent, "touchend", handleTouchend);
        Events.off(scrollParent, "touchcancel", handleTouchend);
      };
    };

    let resizeObserver: ResizeObserver | null = null;
    const updateScrollParent = () => {
      const nextScrollParent = getScrollParent(pullRef.current);
      if (nextScrollParent === scrollParentRef.current) return;

      unbindScrollParentEvents();
      unbindScrollParentEvents = () => {};
      scrollParentRef.current = nextScrollParent;

      if (resizeObserver && observedParent) {
        resizeObserver.unobserve(observedParent);
      }
      observedParent = nextScrollParent instanceof Element ? nextScrollParent : null;
      if (resizeObserver && observedParent) {
        resizeObserver.observe(observedParent);
      }

      if (enabled && nextScrollParent) {
        unbindScrollParentEvents = bindScrollParentEvents(nextScrollParent);
      }
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateScrollParent);
      if (pullRef.current) resizeObserver.observe(pullRef.current);
    }

    updateScrollParent();
    window.addEventListener("resize", updateScrollParent);
    window.addEventListener("orientationchange", updateScrollParent);

    return () => {
      unbindScrollParentEvents();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateScrollParent);
      window.removeEventListener("orientationchange", updateScrollParent);
      scrollParentRef.current = null;
    };
  }, [enabled]);

  return [pullRef, scrollParentRef] as const;
};
