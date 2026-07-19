"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./seeded-flowlines.css";

interface SeededFlowlinesProps {
  children?: ReactNode;
  className?: string;
}

interface FlowPoint {
  x: number;
  y: number;
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function buildFlowlines(width: number, height: number) {
  const random = seededRandom(0x51a7e);
  const lines: FlowPoint[][] = [];
  const step = Math.max(5, width / 115);

  for (let lineIndex = 0; lineIndex < 34; lineIndex += 1) {
    let x = -width * 0.08 - random() * 24;
    let y = height * (-0.1 + random() * 1.2);
    const line: FlowPoint[] = [];

    for (let pointIndex = 0; pointIndex < 132; pointIndex += 1) {
      line.push({ x, y });
      const angle =
        -0.08 +
        Math.sin(y * 0.012 + lineIndex * 0.17) * 0.34 +
        Math.cos(x * 0.006 + lineIndex * 0.09) * 0.2;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
    }
    lines.push(line);
  }

  return lines;
}

export function SeededFlowlines({
  children,
  className = "",
}: SeededFlowlinesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const baseCanvas = document.createElement("canvas");
    const baseContext = baseCanvas.getContext("2d");
    if (!root || !canvas || !context || !baseContext) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastPaint = 0;
    let inView = false;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let lines: FlowPoint[][] = [];

    const rasterizeBase = () => {
      baseContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      baseContext.clearRect(0, 0, width, height);
      baseContext.lineCap = "round";
      baseContext.lineJoin = "round";
      baseContext.lineWidth = 0.8;
      baseContext.strokeStyle = "rgba(26, 69, 55, 0.15)";
      for (const line of lines) {
        baseContext.beginPath();
        line.forEach((point, index) => {
          if (index === 0) baseContext.moveTo(point.x, point.y);
          else baseContext.lineTo(point.x, point.y);
        });
        baseContext.stroke();
      }
    };

    const draw = (time = 0) => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(baseCanvas, 0, 0);

      if (reduceMotion.matches || time === 0) return;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.lineCap = "round";
      context.globalCompositeOperation = "multiply";
      context.lineWidth = 1.35;
      for (const [lineIndex, line] of lines.entries()) {
        const head = Math.floor(
          ((time / 6800 + lineIndex * 0.061) % 1) * (line.length - 1),
        );
        for (let trail = 0; trail < 8; trail += 1) {
          const pointIndex = (head - trail + line.length - 1) % (line.length - 1);
          const from = line[pointIndex];
          const to = line[pointIndex + 1];
          if (!from || !to) continue;
          context.strokeStyle = `rgba(190, 78, 46, ${0.2 * (1 - trail / 8)})`;
          context.beginPath();
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
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
      const shouldRun = inView && !document.hidden && !reduceMotion.matches;
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
      baseCanvas.width = canvas.width;
      baseCanvas.height = canvas.height;
      lines = buildFlowlines(width, height);
      rasterizeBase();
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
    <div ref={rootRef} className={`tb-seeded-flowlines ${className}`.trim()}>
      <div className="tb-seeded-flowlines__fallback" aria-hidden="true" />
      <canvas ref={canvasRef} className="tb-seeded-flowlines__canvas" aria-hidden="true" />
      <div className="tb-seeded-flowlines__content">{children}</div>
    </div>
  );
}
