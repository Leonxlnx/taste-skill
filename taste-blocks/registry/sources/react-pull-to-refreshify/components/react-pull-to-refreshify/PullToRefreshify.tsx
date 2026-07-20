"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { PullStatus, PullToRefreshifyProps } from "./types";
import { Events } from "./utils/events";
import { getScrollTop } from "./utils/getScrollTop";
import { useDrag } from "./utils/useDrag";
import { useScrollParent } from "./utils/useScrollParent";
import { useUnmountedRef } from "./utils/useUnmountedRef";
import { useUpdateEffect } from "./utils/useUpdateEffect";

const visuallyHiddenStyle = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

const defaultLiveStatus: Record<PullStatus, string> = {
  normal: "",
  pulling: "Pulling to refresh",
  canRelease: "Release to refresh",
  refreshing: "Refreshing",
  complete: "Refresh complete",
};

export const PullToRefreshify = ({
  className,
  style,
  animationDuration = 300,
  completeDelay = 500,
  refreshing = false,
  headHeight = 50,
  startDistance = 30,
  resistance = 0.6,
  threshold = headHeight,
  onRefresh,
  disabled = false,
  prefixCls = "pull-to-refreshify",
  refreshButtonLabel = "Refresh",
  renderStatus,
  renderText,
  children,
}: PullToRefreshifyProps) => {
  const [pullRef, scrollParentRef] = useScrollParent(!disabled);
  const unmountedRef = useUnmountedRef();
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRequestedRef = useRef(refreshing);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [[offsetY, duration, status], setState] = useState<
    [number, number, PullStatus]
  >(
    refreshing
      ? [headHeight, animationDuration, "refreshing"]
      : [0, 0, "normal"]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(
    () => () => {
      if (completeTimerRef.current !== null) {
        clearTimeout(completeTimerRef.current);
      }
    },
    []
  );

  const dispatch = (nextStatus: PullStatus, dragOffsetY = 0) => {
    if (completeTimerRef.current !== null) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = null;
    }

    switch (nextStatus) {
      case "pulling":
      case "canRelease":
        setState([dragOffsetY, 0, nextStatus]);
        break;

      case "refreshing":
        setState([headHeight, animationDuration, nextStatus]);
        break;

      case "complete":
        setState([headHeight, animationDuration, nextStatus]);
        if (unmountedRef.current) return;
        completeTimerRef.current = setTimeout(() => {
          completeTimerRef.current = null;
          if (!unmountedRef.current && !refreshRequestedRef.current) {
            setState([0, animationDuration, "normal"]);
          }
        }, Math.max(0, completeDelay));
        break;

      default:
        setState([0, animationDuration, nextStatus]);
    }
  };

  // Skip the first render
  useUpdateEffect(() => {
    if (refreshing) {
      refreshRequestedRef.current = true;
      dispatch("refreshing");
    } else {
      refreshRequestedRef.current = false;
      dispatch("complete");
    }
  }, [refreshing]);

  const triggerRefresh = () => {
    if (
      disabled ||
      refreshing ||
      refreshRequestedRef.current ||
      (status !== "normal" && status !== "canRelease") ||
      typeof onRefresh !== "function"
    ) {
      return;
    }

    refreshRequestedRef.current = true;
    dispatch("refreshing");
    try {
      onRefresh();
    } catch (error) {
      refreshRequestedRef.current = false;
      dispatch("normal");
      throw error;
    }
  };

  // Handle drag events
  const dragRef = useDrag({
    onDragMove: (event, { offsetX, offsetY: dragOffsetY }) => {
      if (
        // Not set onRefresh event
        !onRefresh ||
        // Pull up or continue a horizontal gesture
        dragOffsetY <= 0 ||
        Math.abs(dragOffsetY) <= Math.abs(offsetX) ||
        // Not scrolled to top
        getScrollTop(scrollParentRef.current) > 0 ||
        // Refreshing state has been triggered
        ["refreshing", "complete"].includes(status) ||
        disabled
      ) {
        return false;
      }

      // Solve the bug that the low-end Android system only triggers the touchmove event once
      if (!Events.isSupportsPassive() && event.cancelable) {
        event.preventDefault();
      }

      const viewportHeight = Math.max(
        typeof window === "undefined" ? 0 : window.innerHeight,
        1
      );
      const ratio = Math.min(dragOffsetY / viewportHeight, 1);
      const offset = Math.max(0, dragOffsetY * (1 - ratio) * resistance);

      // Determine whether the condition for releasing immediate refresh is met
      const action =
        offset - startDistance < threshold ? "pulling" : "canRelease";

      dispatch(action, offset);
      return true;
    },
    onDragEnd: (_, { offsetY: dragOffsetY }) => {
      if (!dragOffsetY) return;

      if (disabled || status !== "canRelease") {
        if (status === "pulling" || status === "canRelease") {
          dispatch("normal");
        }
        return;
      }

      triggerRefresh();
    },
    onDragCancel: () => {
      if (status === "pulling" || status === "canRelease") {
        dispatch("normal");
      }
    },
  });

  let percent = 0;
  if (offsetY >= startDistance) {
    percent =
      threshold > 0
        ? ((offsetY - startDistance < threshold
            ? offsetY - startDistance
            : threshold) *
            100) /
          threshold
        : 100;
  }

  const liveStatus = useMemo(
    () => (renderStatus ? renderStatus(status) : defaultLiveStatus[status]),
    [renderStatus, status]
  );
  const refreshUnavailable = disabled || refreshing || status !== "normal";
  const transitionDuration = reducedMotion ? 0 : duration;

  return (
    <div
      ref={dragRef}
      aria-busy={status === "refreshing"}
      aria-disabled={disabled || undefined}
      className={className ? `${prefixCls} ${className}` : prefixCls}
      style={{
        minHeight: headHeight,
        overflowY: "hidden",
        touchAction: "pan-y",
        ...style,
      }}
    >
      <div
        className={`${prefixCls}__controls`}
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0.5rem",
        }}
      >
        <button
          type="button"
          className={`${prefixCls}__button`}
          disabled={refreshUnavailable}
          onClick={triggerRefresh}
          style={{
            minHeight: 44,
            padding: "0.625rem 0.875rem",
            border: "1px solid currentColor",
            borderRadius: "0.5rem",
            background: "transparent",
            color: "inherit",
            cursor: refreshUnavailable ? "not-allowed" : "pointer",
            font: "inherit",
            opacity: refreshUnavailable ? 0.55 : 1,
            touchAction: "manipulation",
            whiteSpace: "nowrap",
          }}
        >
          {refreshButtonLabel}
        </button>
      </div>
      <div
        ref={pullRef}
        className={`${prefixCls}__content`}
        style={{
          willChange: "transform",
          WebkitTransition: `transform ${transitionDuration}ms`,
          transition: `transform ${transitionDuration}ms`,
          WebkitTransform: `translate3d(0, ${offsetY}px, 0)`,
          transform: `translate3d(0, ${offsetY}px, 0)`,
        }}
      >
        <div
          key={offsetY.toFixed(0)}
          aria-hidden="true"
          className={`${prefixCls}__refresh`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "inherit",
            fontSize: "14px",
            marginTop: -headHeight,
            height: headHeight,
          }}
        >
          {renderText(status, percent)}
        </div>
        <div className={`${prefixCls}__body`}>{children}</div>
      </div>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={visuallyHiddenStyle}
      >
        {liveStatus}
      </span>
    </div>
  );
};
