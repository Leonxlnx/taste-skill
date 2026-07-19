"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./edge-light.css";

interface EdgeLightProps {
  children: ReactNode;
  className?: string;
}

export function EdgeLight({ children, className = "" }: EdgeLightProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let clientX = 0;
    let clientY = 0;
    let bounds = root.getBoundingClientRect();
    let boundsDirty = false;

    const measure = () => {
      bounds = root.getBoundingClientRect();
      boundsDirty = false;
    };

    const invalidateBounds = () => {
      boundsDirty = true;
    };

    const paint = () => {
      frame = 0;
      if (boundsDirty) measure();
      const x = Math.max(0, Math.min(bounds.width, clientX - bounds.left));
      const y = Math.max(0, Math.min(bounds.height, clientY - bounds.top));
      const nearest = Math.min(y, bounds.width - x, bounds.height - y, x);
      let edgeX = x;
      let edgeY = y;

      if (nearest === y) edgeY = 0;
      else if (nearest === bounds.width - x) edgeX = bounds.width;
      else if (nearest === bounds.height - y) edgeY = bounds.height;
      else edgeX = 0;

      overlay.style.setProperty("--tb-edge-light-x", `${edgeX}px`);
      overlay.style.setProperty("--tb-edge-light-y", `${edgeY}px`);
    };

    const handlePointer = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    const handlePointerEntry = (event: PointerEvent) => {
      invalidateBounds();
      handlePointer(event);
    };

    const configure = () => {
      root.removeEventListener("pointermove", handlePointer);
      root.removeEventListener("pointerenter", handlePointerEntry);
      cancelAnimationFrame(frame);
      frame = 0;
      if (finePointer.matches && !reduceMotion.matches) {
        root.addEventListener("pointerenter", handlePointerEntry, { passive: true });
        root.addEventListener("pointermove", handlePointer, { passive: true });
      } else {
        overlay.style.removeProperty("--tb-edge-light-x");
        overlay.style.removeProperty("--tb-edge-light-y");
      }
    };

    const resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver(invalidateBounds)
        : null;
    const layoutObserver =
      "MutationObserver" in window && root.parentElement
        ? new MutationObserver(invalidateBounds)
        : null;
    resizeObserver?.observe(root);
    if (root.parentElement) resizeObserver?.observe(root.parentElement);
    if (root.parentElement) {
      layoutObserver?.observe(root.parentElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      });
    }
    document.addEventListener("scroll", invalidateBounds, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", invalidateBounds, { passive: true });
    document.fonts?.addEventListener("loadingdone", invalidateBounds);
    configure();
    finePointer.addEventListener("change", configure);
    reduceMotion.addEventListener("change", configure);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      layoutObserver?.disconnect();
      document.removeEventListener("scroll", invalidateBounds, true);
      window.removeEventListener("resize", invalidateBounds);
      document.fonts?.removeEventListener("loadingdone", invalidateBounds);
      root.removeEventListener("pointerenter", handlePointerEntry);
      root.removeEventListener("pointermove", handlePointer);
      finePointer.removeEventListener("change", configure);
      reduceMotion.removeEventListener("change", configure);
    };
  }, []);

  return (
    <div ref={rootRef} className={`tb-edge-light ${className}`.trim()}>
      <span
        ref={overlayRef}
        className="tb-edge-light__overlay"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
