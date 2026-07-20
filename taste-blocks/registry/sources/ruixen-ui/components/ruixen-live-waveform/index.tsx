"use client";

import * as React from "react";
import { Square } from "lucide-react";
import { cn } from "../shared/ruixen-utils";

export interface LiveWaveformProps {
  /** Enable real-time microphone input visualization */
  active?: boolean;
  /** Show animated processing wave pattern */
  processing?: boolean;
  /** Bar width in pixels */
  barWidth?: number;
  /** Gap between bars in pixels */
  barGap?: number;
  /** Bar corner radius */
  barRadius?: number;
  /** Bar color — inherits currentColor when unset */
  barColor?: string;
  /** Waveform height in pixels */
  height?: number;
  /** Apply gradient fade at edges */
  fadeEdges?: boolean;
  /** Fade gradient width in pixels */
  fadeWidth?: number;
  /** Microphone sensitivity multiplier */
  sensitivity?: number;
  /** Callback when stop button is pressed */
  onStop?: () => void;
  /** Called when microphone access or setup fails. */
  onError?: (error: Error) => void;
  /** Accessible description for the canvas. */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

function roundedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  ctx.fill();
}

export default function LiveWaveform({
  active = false,
  processing = false,
  barWidth = 3,
  barGap = 2,
  barRadius = 1.5,
  barColor,
  height = 48,
  fadeEdges = true,
  fadeWidth = 24,
  sensitivity = 1,
  onStop,
  onError,
  label = "Audio waveform",
  className,
}: LiveWaveformProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<number>(0);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const dataRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null);
  const onErrorRef = React.useRef(onError);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const safeBarWidth = Math.max(0.5, barWidth);
  const safeBarGap = Math.max(0, barGap);
  const safeHeight = Math.max(1, height);
  const safeFadeWidth = Math.max(0, fadeWidth);
  const safeSensitivity = Math.max(0, sensitivity);

  onErrorRef.current = onError;

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  /* -------- canvas animation -------- */
  React.useEffect(() => {
    const cvs = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cvs || !wrap) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resolvedColor = barColor ?? getComputedStyle(cvs).color;
    let width = 0;
    let visible = true;
    let interval = 0;

    const resize = () => {
      width = wrap.offsetWidth;
      cvs.width = Math.round(width * dpr);
      cvs.height = Math.round(safeHeight * dpr);
      cvs.style.width = `${width}px`;
      cvs.style.height = `${safeHeight}px`;
    };
    resize();

    const ro = new ResizeObserver(() => {
      resize();
      if (!active && !processing) paint(performance.now());
    });
    ro.observe(wrap);

    const t0 = performance.now();

    const paint = (now: number) => {
      const w = width;
      const h = safeHeight;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = resolvedColor;

      const step = safeBarWidth + safeBarGap;
      const count = Math.ceil(w / step) + 1;
      const t = (now - t0) / 1000;
      const cy = h / 2;

      for (let i = 0; i < count; i++) {
        const x = i * step;
        const pos = i / count;
        let bh = 4;
        let alpha = 1;

        if (processing && !active) {
          /* layered sine waves → organic flowing animation */
          const s1 = Math.sin(t * 2.5 + pos * Math.PI * 4) * 0.38;
          const s2 = Math.sin(t * 1.7 + pos * Math.PI * 6 + 1.3) * 0.24;
          const s3 = Math.sin(t * 3.3 + pos * Math.PI * 2.5 + 0.8) * 0.14;
          const amp = (s1 + s2 + s3 + 0.76) / 1.52;
          bh = Math.max(4, amp * h * 0.82);
        } else if (active && analyserRef.current) {
          const an = analyserRef.current;
          if (
            !dataRef.current ||
            dataRef.current.length !== an.frequencyBinCount
          ) {
            dataRef.current = new Uint8Array(an.frequencyBinCount);
          }
          an.getByteFrequencyData(dataRef.current);
          const idx = Math.floor(pos * dataRef.current.length);
          const val = (dataRef.current[idx] / 255) * safeSensitivity;
          bh = Math.max(4, val * h * 0.85);
        } else {
          /* idle: tiny flat bars */
          alpha = 0.25;
        }

        if (fadeEdges) {
          const edge = Math.min(x, w - x - safeBarWidth);
          if (edge < safeFadeWidth && safeFadeWidth > 0) {
            alpha *= Math.max(0, edge / safeFadeWidth);
          }
        }

        ctx.globalAlpha = alpha;
        roundedBar(ctx, x, cy - bh / 2, safeBarWidth, bh, barRadius);
      }

      ctx.globalAlpha = 1;
    };

    const stop = () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      window.clearInterval(interval);
      interval = 0;
    };

    const start = () => {
      stop();
      paint(performance.now());
      if (!visible || document.hidden || (!active && !processing)) return;
      if (reduceMotion) {
        if (active) {
          interval = window.setInterval(() => paint(performance.now()), 200);
        }
        return;
      }
      const loop = (now: number) => {
        paint(now);
        frameRef.current = requestAnimationFrame(loop);
      };
      frameRef.current = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      start();
    });
    observer.observe(wrap);
    const handleVisibility = () => start();
    document.addEventListener("visibilitychange", handleVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [
    active,
    processing,
    safeBarWidth,
    safeBarGap,
    barRadius,
    safeHeight,
    fadeEdges,
    safeFadeWidth,
    safeSensitivity,
    barColor,
    reduceMotion,
  ]);

  /* -------- microphone -------- */
  React.useEffect(() => {
    if (!active) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (audioCtxRef.current) void audioCtxRef.current.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Microphone input is not supported in this browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const actx = new AudioContext();
        audioCtxRef.current = actx;

        const src = actx.createMediaStreamSource(stream);
        const analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        src.connect(analyser);
        analyserRef.current = analyser;
      } catch (error) {
        if (!cancelled) {
          onErrorRef.current?.(
            error instanceof Error
              ? error
              : new Error("Microphone access failed."),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (audioCtxRef.current) void audioCtxRef.current.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
    };
  }, [active]);

  const isLive = processing || active;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3",
        className,
      )}
    >
      {isLive && onStop && (
        <button
          type="button"
          onClick={onStop}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity hover:opacity-80"
          aria-label="Stop"
        >
          <Square className="size-3 fill-current" />
        </button>
      )}
      <div ref={wrapRef} className="min-w-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={label}
          className="block text-foreground"
          style={{ height: safeHeight }}
        >
          {label}
        </canvas>
      </div>
    </div>
  );
}
