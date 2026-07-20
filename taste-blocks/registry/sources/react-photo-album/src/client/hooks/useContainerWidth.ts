import { useCallback, useReducer, useRef } from "react";

import useArray from "./useArray";
import type { ForwardedRef } from "../../types";

// Maximum expected scrollbar width in pixels, used to distinguish
// scrollbar-induced resize oscillation from legitimate container resizes.
const MAX_SCROLLBAR_WIDTH = 20;

type State = [containerWidth?: number, prevContainerWidth?: number];

function containerWidthReducer(state: State, newContainerWidth: number | undefined): State {
  const [containerWidth, prevContainerWidth] = state;

  if (containerWidth === newContainerWidth) {
    return state;
  }

  // Detect resize loop caused by scrollbar appearance/disappearance: when rendering
  // at width A causes content overflow (scrollbar appears, shrinking width to B), and
  // rendering at width B removes the overflow (scrollbar disappears, restoring width A),
  // the container width oscillates between A and B indefinitely. Settle on the smaller
  // width to break the cycle — the layout fits within the scrollbar-reduced width,
  // preventing further oscillation.
  if (
    prevContainerWidth !== undefined &&
    newContainerWidth !== undefined &&
    containerWidth !== undefined &&
    newContainerWidth === prevContainerWidth &&
    Math.abs(newContainerWidth - containerWidth) <= MAX_SCROLLBAR_WIDTH
  ) {
    const min = Math.min(containerWidth, newContainerWidth);
    const max = Math.max(containerWidth, newContainerWidth);
    // preserve state reference to avoid unnecessary re-renders
    return min === containerWidth && max === prevContainerWidth ? state : [min, max];
  }

  return [newContainerWidth, containerWidth];
}

function resolveContainerWidth(el: HTMLElement | null, breakpoints: readonly number[] | undefined) {
  let width = el?.clientWidth;
  if (width !== undefined && breakpoints && breakpoints.length > 0) {
    const sorted = [...breakpoints.filter((x) => x > 0)].sort((a, b) => b - a);
    sorted.push(Math.floor(sorted[sorted.length - 1] / 2));
    width = sorted.find((breakpoint, index) => breakpoint <= width! || index === sorted.length - 1);
  }
  return width;
}

export default function useContainerWidth(
  ref: ForwardedRef,
  breakpointsArray: readonly number[] | undefined,
  defaultContainerWidth?: number,
) {
  const [[containerWidth], dispatch] = useReducer(containerWidthReducer, [defaultContainerWidth]);
  const breakpoints = useArray(breakpointsArray);
  const observerRef = useRef<ResizeObserver>(undefined);

  const containerRef = useCallback(
    // eslint-disable-next-line react-hooks/immutability -- false-positive lint
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = undefined;

      const updateWidth = () => dispatch(resolveContainerWidth(node, breakpoints));

      updateWidth();

      if (node && typeof ResizeObserver !== "undefined") {
        observerRef.current = new ResizeObserver(updateWidth);
        observerRef.current.observe(node);
      }

      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        // eslint-disable-next-line react-hooks/immutability -- false-positive lint
        ref.current = node;
      }
    },
    [ref, breakpoints],
  );

  return { containerRef, containerWidth };
}
