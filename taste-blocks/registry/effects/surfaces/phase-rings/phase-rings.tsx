"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./phase-rings.css";

interface PhaseRingsProps {
  children?: ReactNode;
  className?: string;
}

export function PhaseRings({ children, className = "" }: PhaseRingsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!root || !canvas || !context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastPaint = 0;
    let inView = false;
    let width = 1;
    let height = 1;
    let dpr = 1;

    const draw = (time = 0) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const sources = [
        { x: width * 0.18, y: height * 0.84, color: "rgba(134, 160, 255, 0.19)" },
        { x: width * 0.78, y: height * 0.22, color: "rgba(255, 150, 119, 0.16)" },
        { x: width * 0.92, y: height * 0.92, color: "rgba(229, 220, 181, 0.09)" },
      ];
      const maxRadius = Math.hypot(width, height);
      const step = maxRadius / 22;
      const phase = reduceMotion.matches
        ? 0
        : Math.sin(time * 0.00028) * Math.min(width, height) * 0.018;

      context.lineWidth = 1;
      context.globalCompositeOperation = "screen";
      for (const [sourceIndex, source] of sources.entries()) {
        context.strokeStyle = source.color;
        for (let ring = 1; ring <= 22; ring += 1) {
          const radius = ring * step;
          const offset = (sourceIndex - 1) * phase;
          context.beginPath();
          context.arc(source.x, source.y, Math.max(1, radius + offset), 0, Math.PI * 2);
          context.stroke();
        }
      }
      context.globalCompositeOperation = "source-over";
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = (time: number) => {
      if (time - lastPaint > 50) {
        draw(time);
        lastPaint = time;
      }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldRun =
        inView && !document.hidden && !reduceMotion.matches;
      stop();
      if (shouldRun) frame = requestAnimationFrame(tick);
      else draw(0);
    };

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      dpr = window.innerWidth < 640 ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      draw(0);
    };

    const intersection =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              inView = Boolean(entry?.isIntersecting);
              sync();
            },
            { rootMargin: "0px" },
          )
        : null;
    const resizeObserver =
      "ResizeObserver" in window ? new ResizeObserver(resize) : null;
    const handleVisibility = () => sync();
    const handleMotion = () => sync();

    resize();
    intersection?.observe(root);
    resizeObserver?.observe(root);
    if (!resizeObserver) window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    reduceMotion.addEventListener("change", handleMotion);

    return () => {
      stop();
      intersection?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      reduceMotion.removeEventListener("change", handleMotion);
    };
  }, []);

  return (
    <div ref={rootRef} className={`tb-phase-rings ${className}`.trim()}>
      <div className="tb-phase-rings__fallback" aria-hidden="true" />
      <canvas ref={canvasRef} className="tb-phase-rings__canvas" aria-hidden="true" />
      <div className="tb-phase-rings__content">{children}</div>
    </div>
  );
}
