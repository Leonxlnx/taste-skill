import { useCallback, useEffect, useRef, useState } from 'react';
import { getContentWidth } from '../helpers/style.ts';
import { useIsomorphicLayoutEffect } from '../helpers/react.ts';
import { flushSync } from 'react-dom';

export function useContentWidth(element: Element | undefined) {
  const [width, setWidth] = useState<number>();
  const widthRef = useRef<number>(undefined);

  const syncWidth = useCallback(() => {
    const newWidth = element ? getContentWidth(element) : undefined;

    if (widthRef.current !== newWidth) {
      widthRef.current = newWidth;
      setWidth(newWidth);
    }
  }, [element]);

  useIsomorphicLayoutEffect(syncWidth);

  useEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver(
      withResizeLoopDetection(() => flushSync(syncWidth)),
    );

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [element, syncWidth]);

  return width;
}

function withResizeLoopDetection(callback: () => void) {
  return (entries: ResizeObserverEntry[], resizeObserver: ResizeObserver) => {
    const elements = entries.map(entry => entry.target);

    const rectsBefore = elements.map(element => element.getBoundingClientRect());

    callback();

    const rectsAfter = elements.map(element => element.getBoundingClientRect());

    const changedElements = elements.filter(
      (_, i) => !areRectSizesEqual(rectsBefore[i], rectsAfter[i]),
    );

    changedElements.forEach(element =>
      unobserveUntilNextFrame(element, resizeObserver),
    );
  };
}

function unobserveUntilNextFrame(element: Element, resizeObserver: ResizeObserver) {
  resizeObserver.unobserve(element);

  requestAnimationFrame(() => {
    resizeObserver.observe(element);
  });
}

function areRectSizesEqual(rect1: DOMRect, rect2: DOMRect) {
  return rect1.width === rect2.width && rect1.height === rect2.height;
}
