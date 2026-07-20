"use client";

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../lib/utils";
import { spring } from "../lib/springs";
import { fontWeights } from "../lib/font-weight";
import { useShape } from "../lib/shape-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SliderValue = number | [number, number];
type ValuePosition = "left" | "right" | "top" | "bottom" | "tooltip";

interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value: SliderValue;
  onChange: (value: SliderValue) => void;
  min?: number;
  max?: number;
  step?: number;
  /**
   * Discrete list of allowed values, e.g. [0.1, 0.5, 0.7, 1.1, 1.3].
   *
   * When set, the thumb snaps only to these values (positioned proportionally
   * along the track) and arrow keys walk the list. `min`/`max` derive from the
   * list's extremes and `step` is ignored.
   */
  steps?: number[];
  showSteps?: boolean;
  showValue?: boolean;
  valuePosition?: ValuePosition;
  formatValue?: (v: number) => string;
  label?: string;
  disabled?: boolean;
  trackClassName?: string;
  trackStyle?: CSSProperties;
  fillClassName?: string;
  fillStyle?: CSSProperties;
  hideFill?: boolean;
  thumbColor?: string;
  thumbBorderColor?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const THUMB_SIZE = 20;
const THUMB_SIZE_REST = 16;
const TRACK_BG_HEIGHT = 18;
const DOT_SIZE = 4;
const PIP_SIZE = 5;
// Inset track BG so its rounded-end centers align with thumb centers at min/max
const TRACK_INSET = (THUMB_SIZE - TRACK_BG_HEIGHT) / 2;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function valueToPixel(
  v: number,
  min: number,
  max: number,
  trackWidth: number
): number {
  if (max === min) return 0;
  const usable = trackWidth - THUMB_SIZE;
  return ((v - min) / (max - min)) * usable;
}

function nearestStepIndex(v: number, steps: number[]): number {
  let idx = 0;
  for (let i = 1; i < steps.length; i++) {
    if (Math.abs(steps[i] - v) < Math.abs(steps[idx] - v)) idx = i;
  }
  return idx;
}

function pixelToValue(
  px: number,
  min: number,
  max: number,
  step: number,
  trackWidth: number,
  stepValues: number[] | null = null
): number {
  const usable = trackWidth - THUMB_SIZE;
  if (usable <= 0) return min;
  const raw = (px / usable) * (max - min) + min;
  if (stepValues) return stepValues[nearestStepIndex(raw, stepValues)];
  const snapped = Math.round((raw - min) / step) * step + min;
  return Math.max(min, Math.min(max, snapped));
}

function toRadixValue(value: SliderValue): number[] {
  return Array.isArray(value) ? value : [value];
}

// ---------------------------------------------------------------------------
// ValueDisplay (internal)
// ---------------------------------------------------------------------------

interface ValueDisplayProps {
  values: number[];
  editingIndex: number | null;
  onStartEdit: (index: number) => void;
  onCommitEdit: (index: number, v: number) => void;
  onCancelEdit: () => void;
  min: number;
  max: number;
  step: number;
  stepValues: number[] | null;
  formatValue: (v: number) => string;
  label?: string;
  isRange: boolean;
  isInteracting: boolean;
}

function ValueDisplay({
  values,
  editingIndex,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  min,
  max,
  step,
  stepValues,
  formatValue,
  label,
  isRange,
  isInteracting,
}: ValueDisplayProps) {
  const shape = useShape();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIndex !== null) {
      setInputValue(String(values[editingIndex]));
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editingIndex]);

  const commitEdit = useCallback(
    (index: number) => {
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        const clamped = Math.max(min, Math.min(max, parsed));
        const snapped = stepValues
          ? stepValues[nearestStepIndex(clamped, stepValues)]
          : Math.round((clamped - min) / step) * step + min;
        onCommitEdit(index, snapped);
      } else {
        onCancelEdit();
      }
    },
    [inputValue, min, max, step, stepValues, onCommitEdit, onCancelEdit]
  );

  const renderValue = (index: number) => {
    if (editingIndex === index) {
      return (
        <span className="inline-grid text-[13px]">
          {/* Ghost for layout stability — widest possible value */}
          <span
            className="col-start-1 row-start-1 invisible"
            style={{ fontVariationSettings: fontWeights.medium }}
            aria-hidden="true"
          >
            {label ? `${label}: ` : ""}
            {formatValue(max)}
          </span>
          <span className="col-start-1 row-start-1 flex items-center gap-1">
            {label && (
              <span className="text-muted-foreground">{label}:</span>
            )}
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              min={min}
              max={max}
              step={stepValues ? "any" : step}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => commitEdit(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit(index);
                if (e.key === "Escape") onCancelEdit();
              }}
              aria-label={`Edit slider value${isRange ? (index === 0 ? " (start)" : " (end)") : ""}`}
              className={cn(
                "w-[5ch] bg-transparent text-foreground outline-none border-b border-border text-center",
                shape.input
              )}
              style={{ fontVariationSettings: fontWeights.medium }}
            />
          </span>
        </span>
      );
    }

    return (
      <span
        className="cursor-text select-none"
        onClick={() => onStartEdit(index)}
      >
        {formatValue(values[index])}
      </span>
    );
  };


  const widestValue = isRange
    ? `${label ? `${label}: ` : ""}${formatValue(max)} — ${formatValue(max)}`
    : `${label ? `${label}: ` : ""}${formatValue(max)}`;

  return (
    <span
      className={cn(
        "inline-grid shrink-0 text-[13px] leading-none text-muted-foreground transition-[font-variation-settings] duration-100",
        "tabular-nums"
      )}
      style={{
        fontVariationSettings: isInteracting
          ? fontWeights.medium
          : fontWeights.normal,
      }}
    >
      {/* Invisible ghost — reserves width of widest possible value */}
      <span
        className="col-start-1 row-start-1 invisible whitespace-nowrap"
        style={{ fontVariationSettings: fontWeights.medium }}
        aria-hidden="true"
      >
        {widestValue}
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap">
        {label && editingIndex === null && (
          <span className="text-muted-foreground">{label}: </span>
        )}
        {isRange ? (
          <>
            {renderValue(0)}
            <span className="mx-1 text-muted-foreground/50">—</span>
            {renderValue(1)}
          </>
        ) : (
          renderValue(0)
        )}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// TooltipValue (internal)
// ---------------------------------------------------------------------------

interface TooltipValueProps {
  value: number;
  formatValue: (v: number) => string;
  motionX: MotionValue<number>;
}

function TooltipValue({ value, formatValue, motionX }: TooltipValueProps) {
  const shape = useShape();
  const tooltipX = useTransform(motionX, (x) => x + THUMB_SIZE / 2);
  return (
    <motion.div
      className="absolute -translate-x-1/2 pointer-events-none z-20"
      style={{
        x: tooltipX,
        top: -16,
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4, transition: spring.fast.exit }}
      transition={spring.fast}
    >
      <span
        className={cn("text-[12px] text-background tabular-nums whitespace-nowrap bg-foreground px-2 py-1", shape.bg)}
        style={{ fontVariationSettings: fontWeights.medium }}
      >
        {formatValue(value)}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Slider
// ---------------------------------------------------------------------------

const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      onChange,
      min: minProp = 0,
      max: maxProp = 100,
      step = 1,
      steps,
      showSteps = false,
      showValue = true,
      valuePosition = "left",
      formatValue = String,
      label,
      disabled = false,
      trackClassName,
      trackStyle,
      fillClassName,
      fillStyle,
      hideFill = false,
      thumbColor,
      thumbBorderColor,
      className,
      ...props
    },
    ref
  ) => {
    const isRange = Array.isArray(value);
    const values = toRadixValue(value);
    const shape = useShape();

    // Non-uniform step mode: sorted, deduped list of allowed values. Keyed on
    // the joined string so inline array literals don't recompute every render.
    const stepsKey = steps ? steps.join(",") : "";
    const stepValues = useMemo(() => {
      if (!stepsKey) return null;
      const parsed = Array.from(new Set(stepsKey.split(",").map(Number))).sort(
        (a, b) => a - b
      );
      return parsed.length > 1 ? parsed : null;
    }, [stepsKey]);
    const min = stepValues ? stepValues[0] : minProp;
    const max = stepValues ? stepValues[stepValues.length - 1] : maxProp;

    // --- Refs ---
    const trackRef = useRef<HTMLDivElement>(null);
    const trackWidthRef = useRef(0);
    const dragging = useRef(false);
    const activeDragThumb = useRef<number>(0);
    const valuesRef = useRef(values);
    const minRef = useRef(min);
    const maxRef = useRef(max);
    valuesRef.current = values;
    minRef.current = min;
    maxRef.current = max;

    // --- State ---
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [hoverPreview, setHoverPreview] = useState<{
      left: number;
      width: number;
      snappedValue: number;
      cursorX: number;
    } | null>(null);
    const [focusedThumb, setFocusedThumb] = useState<number | null>(null);
    const [showHoverTooltip, setShowHoverTooltip] = useState(false);
    const hoverDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Show hover tooltip after 100ms delay
    useEffect(() => {
      if (isHovered) {
        hoverDelayRef.current = setTimeout(() => setShowHoverTooltip(true), 100);
      } else {
        if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
        setShowHoverTooltip(false);
      }
      return () => { if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current); };
    }, [isHovered]);

    // --- Motion values ---
    const motionX0 = useMotionValue(0);
    const motionX1 = useMotionValue(0);

    // --- Derived motion values for fill ---
    const fillLeft = useTransform(motionX0, (x) =>
      isRange ? x + THUMB_SIZE / 2 - TRACK_INSET : 0
    );
    const fillWidthSingle = useTransform(motionX0, (x) => x + THUMB_SIZE / 2 - TRACK_INSET);
    const fillWidthRange = useTransform(
      [motionX0, motionX1] as MotionValue<number>[],
      ([x0, x1]) => (x1 as number) - (x0 as number)
    );
    const fillWidth = isRange ? fillWidthRange : fillWidthSingle;

    // --- Step dots mask (hides dots on filled side, like SliderComfortable pips) ---
    const stepDotsMaskSingle = useTransform(
      motionX0,
      (x) => {
        const edge = x + THUMB_SIZE / 2;
        return `linear-gradient(to right, transparent ${edge}px, black ${edge + 2}px)`;
      }
    );
    const stepDotsMaskRange = useTransform(
      [motionX0, motionX1] as MotionValue<number>[],
      ([x0, x1]) => {
        const left = (x0 as number) + THUMB_SIZE / 2;
        const right = (x1 as number) + THUMB_SIZE / 2;
        return `linear-gradient(to right, black ${left - 2}px, transparent ${left}px, transparent ${right}px, black ${right + 2}px)`;
      }
    );
    const stepDotsMask = isRange ? stepDotsMaskRange : stepDotsMaskSingle;

    // --- Hover preview computation ---
    const computeHoverPreview = useCallback(
      (cursorX: number, trackWidth: number) => {
        // cursorX and trackWidth are in layout space (offsetWidth-relative),
        // unaffected by ancestor CSS transforms. THUMB_SIZE / TRACK_INSET are
        // also layout-space, so the math below is consistent end-to-end.
        const usable = trackWidth - THUMB_SIZE;
        const rawPx = cursorX - THUMB_SIZE / 2;
        const clampedPx = Math.max(0, Math.min(usable, rawPx));
        const rawVal = usable > 0 ? (clampedPx / usable) * (max - min) + min : min;
        const snappedVal = stepValues
          ? stepValues[nearestStepIndex(rawVal, stepValues)]
          : Math.max(
              min,
              Math.min(max, Math.round((rawVal - min) / step) * step + min)
            );
        const snappedPercent = max === min ? 0 : (snappedVal - min) / (max - min);
        const snappedX = THUMB_SIZE / 2 + snappedPercent * usable;

        // Find nearest thumb center
        const c0 = motionX0.get() + THUMB_SIZE / 2;
        const c1 = motionX1.get() + THUMB_SIZE / 2;
        const nearestIdx = isRange
          ? (Math.abs(snappedX - c0) <= Math.abs(snappedX - c1) ? 0 : 1)
          : 0;
        const nearest = nearestIdx === 0 ? c0 : c1;

        // Extend hover bar to track edges at extremes so there's no gap
        const edgeX = snappedVal === min ? 0 : snappedVal === max ? trackWidth : snappedX;
        const left = Math.min(nearest, edgeX);
        const width = Math.abs(edgeX - nearest);
        setHoverPreview({ left, width, snappedValue: snappedVal, cursorX: snappedX });
      },
      [min, max, step, stepValues, isRange, motionX0, motionX1]
    );

    // --- Initial sync (before paint) ---
    const initialSyncDone = useRef(false);
    const [ready, setReady] = useState(false);
    useLayoutEffect(() => {
      const el = trackRef.current;
      if (!el || initialSyncDone.current) return;
      const w = el.offsetWidth;
      trackWidthRef.current = w;
      const px0 = valueToPixel(values[0], min, max, w);
      motionX0.set(px0);
      if (isRange && values[1] !== undefined) {
        const px1 = valueToPixel(values[1], min, max, w);
        motionX1.set(px1);
      }
      initialSyncDone.current = true;
      setReady(true);
    }, []);

    // --- Track width measurement (resize only) ---
    useEffect(() => {
      const el = trackRef.current;
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => {
        const w = entry.contentRect.width;
        trackWidthRef.current = w;
        if (!dragging.current && initialSyncDone.current) {
          const v = valuesRef.current;
          const mn = minRef.current;
          const mx = maxRef.current;
          const px0 = valueToPixel(v[0], mn, mx, w);
          animate(motionX0, px0, spring.moderate);
          if (isRange && v[1] !== undefined) {
            const px1 = valueToPixel(v[1], mn, mx, w);
            animate(motionX1, px1, spring.moderate);
          }
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, [isRange, motionX0, motionX1]);

    // --- Sync motion values on value change (keyboard, programmatic) ---
    // Depend on a primitive key rather than the `values` array — its identity
    // changes every render (toRadixValue allocates), which would restart the
    // animation on unrelated re-renders (hover/tooltip state churn).
    const valuesKey = values.join(",");
    useEffect(() => {
      if (!initialSyncDone.current) return;
      if (dragging.current) return;
      const tw = trackWidthRef.current;
      if (tw <= 0) return;
      const v = valuesRef.current;
      const px0 = valueToPixel(v[0], min, max, tw);
      animate(motionX0, px0, spring.moderate);
      if (isRange && v[1] !== undefined) {
        const px1 = valueToPixel(v[1], min, max, tw);
        animate(motionX1, px1, spring.moderate);
      }
    }, [valuesKey, min, max, isRange, motionX0, motionX1]);

    // --- Range crossing prevention ---
    const clampForRange = useCallback(
      (px: number, thumbIndex: number): number => {
        if (!isRange) return px;
        if (thumbIndex === 0) {
          return Math.min(px, motionX1.get() - THUMB_SIZE * 0.5);
        } else {
          return Math.max(px, motionX0.get() + THUMB_SIZE * 0.5);
        }
      },
      [isRange, motionX0, motionX1]
    );

    // --- Emit value change ---
    const emitChange = useCallback(
      (thumbIndex: number, newValue: number) => {
        if (isRange) {
          const newValues: [number, number] = [...(values as [number, number])];
          newValues[thumbIndex] = newValue;
          onChange(newValues);
        } else {
          onChange(newValue);
        }
      },
      [isRange, values, onChange]
    );

    // --- Pointer handlers on track ---
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation(); // Prevent Radix from also handling the drag

        const trackEl = trackRef.current;
        if (!trackEl) return;
        const trackRect = trackEl.getBoundingClientRect();
        const layoutWidth = trackEl.offsetWidth;
        if (layoutWidth <= 0 || trackRect.width <= 0) return;
        // Normalize cursor to layout space so it matches motionX (which is
        // rendered as a CSS-pixel transform), even under ancestor CSS scale.
        const scale = trackRect.width / layoutWidth;
        const localX = (e.clientX - trackRect.left) / scale - THUMB_SIZE / 2;
        const clamped = Math.max(
          0,
          Math.min(layoutWidth - THUMB_SIZE, localX)
        );

        // Determine which thumb to drag
        if (isRange) {
          const dist0 = Math.abs(clamped - motionX0.get());
          const dist1 = Math.abs(clamped - motionX1.get());
          activeDragThumb.current = dist0 <= dist1 ? 0 : 1;
        } else {
          activeDragThumb.current = 0;
        }

        dragging.current = true;
        setIsPressed(true);

        const motionX =
          activeDragThumb.current === 0 ? motionX0 : motionX1;

        // Snap to step grid immediately
        const snappedValue = pixelToValue(
          clamped,
          min,
          max,
          step,
          layoutWidth,
          stepValues
        );
        const snappedPx = valueToPixel(snappedValue, min, max, layoutWidth);

        // Clamp for range crossing
        const finalPx = clampForRange(
          snappedPx,
          activeDragThumb.current
        );
        // Spring-animate thumb to clicked position
        animate(motionX, finalPx, spring.moderate);

        // Update value
        const finalValue = pixelToValue(
          finalPx,
          min,
          max,
          step,
          layoutWidth,
          stepValues
        );
        emitChange(activeDragThumb.current, finalValue);

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      },
      [disabled, isRange, min, max, step, stepValues, motionX0, motionX1, clampForRange, emitChange]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging.current) return;
        e.stopPropagation();
        const trackEl = trackRef.current;
        if (!trackEl) return;
        const trackRect = trackEl.getBoundingClientRect();
        const layoutWidth = trackEl.offsetWidth;
        if (layoutWidth <= 0 || trackRect.width <= 0) return;
        const scale = trackRect.width / layoutWidth;
        const localX = (e.clientX - trackRect.left) / scale - THUMB_SIZE / 2;
        const clamped = Math.max(
          0,
          Math.min(layoutWidth - THUMB_SIZE, localX)
        );

        const motionX =
          activeDragThumb.current === 0 ? motionX0 : motionX1;

        // Snap to step grid during drag
        const snappedValue = pixelToValue(
          clamped,
          min,
          max,
          step,
          layoutWidth,
          stepValues
        );
        const snappedPx = valueToPixel(snappedValue, min, max, layoutWidth);
        const finalPx = clampForRange(
          snappedPx,
          activeDragThumb.current
        );
        motionX.set(finalPx);

        const finalValue = pixelToValue(
          finalPx,
          min,
          max,
          step,
          layoutWidth,
          stepValues
        );
        emitChange(activeDragThumb.current, finalValue);
      },
      [min, max, step, stepValues, motionX0, motionX1, clampForRange, emitChange]
    );

    const handlePointerUp = useCallback(() => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsPressed(false);
      setHoverPreview(null);

      // Spring settle to final quantized position
      const tw = trackWidthRef.current;
      const motionX =
        activeDragThumb.current === 0 ? motionX0 : motionX1;
      const currentPx = motionX.get();
      const snapped = pixelToValue(currentPx, min, max, step, tw, stepValues);
      const snappedPx = valueToPixel(snapped, min, max, tw);
      animate(motionX, snappedPx, spring.moderate);
    }, [min, max, step, stepValues, motionX0, motionX1]);

    // --- Radix keyboard handler ---
    // In steps mode the primitive runs on indices (0..len-1, step 1) so arrow
    // keys walk the list; map indices back to actual values on the way out.
    const handleRadixChange = useCallback(
      (newValues: number[]) => {
        if (dragging.current) return;
        const mapped = stepValues
          ? newValues.map((i) => stepValues[Math.round(i)])
          : newValues;
        if (isRange) {
          onChange(mapped as [number, number]);
        } else {
          onChange(mapped[0]);
        }
      },
      [isRange, onChange, stepValues]
    );

    // --- Click-to-edit handlers ---
    const handleStartEdit = useCallback((index: number) => {
      setEditingIndex(index);
    }, []);

    const handleCommitEdit = useCallback(
      (index: number, v: number) => {
        emitChange(index, v);
        setEditingIndex(null);
      },
      [emitChange]
    );

    const handleCancelEdit = useCallback(() => {
      setEditingIndex(null);
    }, []);

    // --- Step dots ---
    const stepDots = useMemo(
      () =>
        showSteps
          ? stepValues
            ? stepValues.map((v) => ({
                value: v,
                percent: max === min ? 0 : (v - min) / (max - min),
              }))
            : Array.from(
                { length: Math.round((max - min) / step) + 1 },
                (_, i) => {
                  const v = min + i * step;
                  const percent = (v - min) / (max - min);
                  return { value: v, percent };
                }
              )
          : [],
      [showSteps, min, max, step, stepValues]
    );

    // --- Interaction state for tooltip ---
    const isInteracting = isHovered || isPressed;

    // --- Per-thumb accessible names ---
    // aria-label on Root lands on a role-less span and never reaches the
    // thumb (which carries role="slider"), so each Thumb gets its own label.
    const thumbAriaLabel = (index: number): string | undefined => {
      if (!isRange) return label;
      if (!label) return index === 0 ? "Minimum" : "Maximum";
      return index === 0 ? `${label} minimum` : `${label} maximum`;
    };

    // --- Value display component ---
    const valueDisplay = showValue && valuePosition !== "tooltip" && (
      <ValueDisplay
        values={values}
        editingIndex={editingIndex}
        onStartEdit={handleStartEdit}
        onCommitEdit={handleCommitEdit}
        onCancelEdit={handleCancelEdit}
        min={min}
        max={max}
        step={step}
        stepValues={stepValues}
        formatValue={formatValue}
        label={label}
        isRange={isRange}
        isInteracting={isInteracting}
      />
    );

    // --- Render visual thumb (not Radix — purely visual) ---
    const renderVisualThumb = (index: number) => {
      const motionX = index === 0 ? motionX0 : motionX1;
      return (
        <motion.span
          key={`visual-thumb-${index}`}
          className="flex items-center justify-center pointer-events-none"
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            marginTop: -THUMB_SIZE / 2,
            x: motionX,
            position: "absolute",
            top: "50%",
            left: 0,
            zIndex: 10,
          }}
          initial={false}
        >
          <motion.span
            className="block rounded-full"
            initial={false}
            animate={{
              width: THUMB_SIZE_REST,
              height: THUMB_SIZE_REST,
            }}
            transition={spring.fast}
            style={{
              backgroundColor: thumbColor ?? "white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              border: thumbBorderColor ? `1px solid ${thumbBorderColor}` : undefined,
            }}
          />
          {/* Focus ring */}
          <motion.span
            className="absolute rounded-full border border-[color:var(--focus-ring,#6B97FF)] pointer-events-none"
            initial={false}
            animate={{
              opacity: focusedThumb === index ? 1 : 0,
              width: THUMB_SIZE + 4,
              height: THUMB_SIZE + 4,
            }}
            transition={spring.fast}
          />
        </motion.span>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-0 w-full select-none touch-none overflow-visible",
          valuePosition === "left" || valuePosition === "right"
            ? "flex-row items-center gap-2 mb-2"
            : "flex-col",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        {/* Top / Left value */}
        {(valuePosition === "top" || valuePosition === "left") && valueDisplay}

        {/* Track area */}
        <div
          className="relative flex-1 overflow-visible"
          style={{
            height: (valuePosition === "left" || valuePosition === "right")
              ? THUMB_SIZE + 16
              : THUMB_SIZE + (valuePosition === "tooltip" ? 16 : 0),
            paddingTop: valuePosition === "tooltip" ? 16 : 0,
          }}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => {
            setIsHovered(false);
            setHoverPreview(null);
          }}
          onMouseMove={(e) => {
            if (dragging.current) return;
            const trackEl = trackRef.current;
            if (!trackEl) return;
            const trackRect = trackEl.getBoundingClientRect();
            const layoutWidth = trackEl.offsetWidth;
            if (layoutWidth <= 0 || trackRect.width <= 0) return;
            // Normalize to layout space so the formula's THUMB_SIZE / TRACK_INSET
            // constants (layout px) match the cursor's coordinate space, even
            // when an ancestor applies a CSS scale transform (e.g. /demo).
            const scale = trackRect.width / layoutWidth;
            const layoutX = (e.clientX - trackRect.left) / scale;
            const clamped = Math.max(0, Math.min(layoutWidth, layoutX));
            computeHoverPreview(clamped, layoutWidth);
          }}
        >
          {/* Tooltip values */}
          {showValue && valuePosition === "tooltip" && (
            <AnimatePresence>
              {isInteracting && (
                <TooltipValue
                  key="tooltip-0"
                  value={values[0]}
                  formatValue={formatValue}
                  motionX={motionX0}
                />
              )}
              {isInteracting && isRange && values[1] !== undefined && (
                <TooltipValue
                  key="tooltip-1"
                  value={values[1]}
                  formatValue={formatValue}
                  motionX={motionX1}
                />
              )}
            </AnimatePresence>
          )}

          {/* Radix Slider — invisible, provides ARIA + keyboard nav */}
          <SliderPrimitive.Root
            value={
              stepValues
                ? values.map((v) => nearestStepIndex(v, stepValues))
                : values
            }
            onValueChange={handleRadixChange}
            min={stepValues ? 0 : min}
            max={stepValues ? stepValues.length - 1 : max}
            step={stepValues ? 1 : step}
            disabled={disabled}
            className="absolute inset-0 opacity-0 pointer-events-none"
            style={{ height: THUMB_SIZE }}
          >
            <SliderPrimitive.Track className="w-full h-full">
              <SliderPrimitive.Range />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              aria-label={thumbAriaLabel(0)}
              aria-valuetext={stepValues ? formatValue(values[0]) : undefined}
              className="block outline-none"
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
              onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setFocusedThumb(0); }}
              onBlur={() => setFocusedThumb((prev) => prev === 0 ? null : prev)}
            />
            {isRange && (
              <SliderPrimitive.Thumb
                aria-label={thumbAriaLabel(1)}
                aria-valuetext={stepValues ? formatValue(values[1]) : undefined}
                className="block outline-none"
                style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setFocusedThumb(1); }}
                onBlur={() => setFocusedThumb((prev) => prev === 1 ? null : prev)}
              />
            )}
          </SliderPrimitive.Root>

          {/* Visual track with pointer handlers */}
          <div
            ref={trackRef}
            className="relative w-full cursor-ew-resize py-2"
            style={{ height: THUMB_SIZE + 16, opacity: ready ? 1 : 0 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Extended hit area — 8px beyond each edge */}
            <div
              className="absolute cursor-ew-resize"
              style={{ left: -8, right: -8, top: 0, bottom: 0 }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
            {/* Hover value tooltip */}
            <AnimatePresence>
              {hoverPreview && showHoverTooltip && !isPressed && valuePosition !== "tooltip" && (
                <motion.div
                  key="hover-tooltip"
                  className="absolute -translate-x-1/2 pointer-events-none z-20"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4, transition: spring.fast.exit }}
                  transition={spring.fast}
                  style={{
                    left: hoverPreview.cursorX,
                    top: -20,
                  }}
                >
                  <span
                    className={cn("text-[12px] text-background tabular-nums whitespace-nowrap bg-foreground px-2 py-1", shape.bg)}
                    style={{ fontVariationSettings: fontWeights.medium }}
                  >
                    {formatValue(hoverPreview.snappedValue)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Track background */}
            <motion.div
              className={cn("absolute border border-border overflow-hidden rounded-full", trackClassName)}
              initial={false}
              animate={{
                height: TRACK_BG_HEIGHT,
                top: 8 + (THUMB_SIZE - TRACK_BG_HEIGHT) / 2,
              }}
              transition={spring.fast}
              style={{
                left: TRACK_INSET,
                right: TRACK_INSET,
                backgroundColor: "transparent",
                ...trackStyle,
              }}
            >
              {/* Filled range */}
              {!hideFill && (
              <motion.div
                className={cn("absolute h-full bg-selected/50 dark:bg-accent/40", fillClassName)}
                style={{
                  left: fillLeft,
                  width: fillWidth,
                  ...fillStyle,
                }}
              />
              )}

              {/* Hover preview */}
              <motion.div
                className="absolute h-full pointer-events-none z-[2]"
                initial={false}
                animate={{
                  opacity: hoverPreview && !isPressed ? 1 : 0,
                }}
                transition={{
                  opacity: { duration: 0.15 },
                }}
                style={{
                  left: hoverPreview ? hoverPreview.left - TRACK_INSET : 0,
                  width: hoverPreview ? hoverPreview.width : 0,
                  borderRadius: hoverPreview && hoverPreview.cursorX > hoverPreview.left
                    ? "0 9999px 9999px 0"
                    : "9999px 0 0 9999px",
                  backgroundColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)",
                }}
              />

            </motion.div>

            {/* Step dots — masked so filled side is hidden */}
            {stepDots.length > 0 && (
              <motion.div
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: 8 + (THUMB_SIZE - TRACK_BG_HEIGHT) / 2,
                  height: TRACK_BG_HEIGHT,
                  WebkitMaskImage: stepDotsMask,
                  maskImage: stepDotsMask,
                }}
              >
                {stepDots.map(({ value: v, percent }) => (
                  <div
                    key={v}
                    className="absolute pointer-events-none flex items-center justify-center"
                    style={{
                      left: `calc(${THUMB_SIZE / 2}px + ${percent} * (100% - ${THUMB_SIZE}px))`,
                      top: "50%",
                      width: 0,
                      height: 0,
                    }}
                  >
                    <motion.div
                      className="rounded-full flex-shrink-0"
                      initial={false}
                      animate={{
                        width: isHovered ? DOT_SIZE * 1.25 : DOT_SIZE,
                        height: isHovered ? DOT_SIZE * 1.25 : DOT_SIZE,
                      }}
                      transition={spring.moderate}
                      style={{
                        backgroundColor: "var(--muted-foreground)",
                        opacity: 0.3,
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Visual thumbs */}
            {renderVisualThumb(0)}
            {isRange && renderVisualThumb(1)}
          </div>
        </div>

        {/* Bottom / Right value */}
        {(valuePosition === "bottom" || valuePosition === "right") &&
          valueDisplay}
      </div>
    );
  }
);

Slider.displayName = "Slider";

// ---------------------------------------------------------------------------
// SliderComfortable
// ---------------------------------------------------------------------------

interface SliderComfortableProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onDrag" | "onDragStart" | "onDragEnd" | "onDragOver" | "onAnimationStart"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  variant?: "pips" | "scrubber";
  label?: string;
  formatValue?: (v: number) => string;
  disabled?: boolean;
}

const SliderComfortable = forwardRef<HTMLDivElement, SliderComfortableProps>(
  (
    {
      value,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      variant = "pips",
      label,
      formatValue = String,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const handleDragging = useRef(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hoverPreview, setHoverPreview] = useState<{
      left: number;
      width: number;
      snappedValue: number;
      cursorX: number;
    } | null>(null);
    const [showHoverTooltip, setShowHoverTooltip] = useState(false);
    const hoverDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shape = useShape();

    // Show hover tooltip after 100ms delay
    useEffect(() => {
      if (isHovered) {
        hoverDelayRef.current = setTimeout(() => setShowHoverTooltip(true), 100);
      } else {
        if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
        setShowHoverTooltip(false);
      }
      return () => { if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current); };
    }, [isHovered]);

    const mergedRef = useCallback(
      (el: HTMLDivElement | null) => {
        containerRef.current = el;
        if (typeof ref === "function") (ref as React.RefCallback<HTMLDivElement>)(el);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = el;
      },
      [ref]
    );

    const pipSteps = useMemo(
      () => Array.from(
        { length: Math.round((max - min) / step) + 1 },
        (_, i) => min + i * step
      ),
      [min, max, step]
    );
    const pipCount = pipSteps.length;

    // Fill motion value
    const fillPercent = useMotionValue(
      max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)))
    );
    // Small offset when value is at min so the handle line stays visible
    const zeroTarget = variant === "pips" ? 8 : 17;
    const zeroOffset = useMotionValue(value === min ? zeroTarget : 0);

    const fillWidthStyle = useTransform(fillPercent, (p) => `${p * 100}%`);
    const handleLeftStyle = useTransform(
      [fillPercent, zeroOffset] as MotionValue<number>[],
      ([p, zo]) => `calc(${(p as number) * 100}% - 8px + ${zo as number}px)`
    );
    const handleLineLeftStyle = useTransform(
      [fillPercent, zeroOffset] as MotionValue<number>[],
      ([p, zo]) => `calc(${(p as number) * 100}% - 9px + ${zo as number}px)`
    );
    // Pips-specific: offset by px-3 (12px) padding so fill edge aligns with active pip center
    const pipsFillWidthStyle = useTransform(
      [fillPercent, zeroOffset] as MotionValue<number>[],
      ([p, zo]) => `calc(${(p as number) * 100}% + ${20 - 20 * (p as number) - (zo as number) * 2.5}px)`
    );
    const pipsHandleLineLeftStyle = useTransform(
      fillPercent,
      (p) => `calc(${p * 100}% + ${11 - 24 * p}px)`
    );
    const pipsMaskStyle = useTransform(
      [fillPercent, zeroOffset] as MotionValue<number>[],
      ([p, zo]) => {
        const offset = 20 - 20 * (p as number) - (zo as number) * 2.5;
        return `linear-gradient(to right, transparent calc(${(p as number) * 100}% + ${offset}px), black calc(${(p as number) * 100}% + ${offset + 2}px))`;
      }
    );

    // --- Hover preview computation ---
    const computeHoverPreview = useCallback(
      (clientX: number) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // Use clientWidth (padding box) — CSS % and absolute left/width are relative to it
        const w = el.clientWidth;
        if (w <= 0 || rect.width <= 0) return;
        // Normalize cursor to layout space so it matches `w` (layout, padding
        // box). offsetWidth is the layout border-box; the difference vs `w` is
        // the horizontal border contribution split across both sides.
        const scale = rect.width / el.offsetWidth;
        const borderLeftLayout = (el.offsetWidth - w) / 2;
        const visualX = clientX - rect.left;
        const layoutX = visualX / scale - borderLeftLayout;
        const clamped = Math.max(0, Math.min(w, layoutX));

        // Snap to nearest step value
        let snappedVal: number;
        if (variant === "pips") {
          if (pipCount <= 1) return;
          const index = Math.max(0, Math.min(pipCount - 1, Math.round((clamped / w) * (pipCount - 1))));
          snappedVal = pipSteps[index];
        } else {
          const raw = min + (clamped / w) * (max - min);
          snappedVal = Math.max(min, Math.min(max, Math.round((raw - min) / step) * step + min));
        }
        const snappedPercent = max === min ? 0 : (snappedVal - min) / (max - min);
        const snappedX = snappedPercent * w;

        // Current handle position — for pips, match the visual fill edge offset
        const currentPercent = fillPercent.get();
        let handleX: number;
        if (variant === "pips") {
          const zo = zeroOffset.get();
          handleX = currentPercent * w + (20 - 20 * currentPercent - zo * 2.5);
        } else {
          handleX = currentPercent * w;
        }

        // Extend hover bar to container edges at extremes so there's no gap
        const edgeX = snappedVal === min ? 0 : snappedVal === max ? w : snappedX;
        const left = Math.min(handleX, edgeX);
        const width = Math.abs(edgeX - handleX);
        setHoverPreview({ left, width, snappedValue: snappedVal, cursorX: snappedX });
      },
      [variant, pipSteps, pipCount, min, max, step, fillPercent, zeroOffset]
    );

    // Sync fill on programmatic value change
    useEffect(() => {
      if (dragging.current || handleDragging.current) return;
      const percent = max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
      animate(fillPercent, percent, spring.fast);
      animate(zeroOffset, value === min ? zeroTarget : 0, spring.fast);
    }, [value, min, max, variant, fillPercent, zeroOffset, zeroTarget]);

    const getValueFromX = useCallback(
      (clientX: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return min;
        const x = clientX - rect.left;
        const clamped = Math.max(0, Math.min(rect.width, x));
        if (variant === "pips") {
          if (pipCount <= 1) return min;
          const index = Math.max(
            0,
            Math.min(pipCount - 1, Math.round((clamped / rect.width) * (pipCount - 1)))
          );
          return pipSteps[index];
        } else {
          const raw = min + (clamped / rect.width) * (max - min);
          const snapped = Math.round((raw - min) / step) * step + min;
          return Math.max(min, Math.min(max, snapped));
        }
      },
      [variant, pipSteps, pipCount, min, max, step]
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        dragging.current = true;
        setIsPressed(true);
        const newVal = getValueFromX(e.clientX);
        onChange(newVal);
        const newPercent = Math.max(0, Math.min(1, (newVal - min) / (max - min)));
        animate(fillPercent, newPercent, spring.fast);
        animate(zeroOffset, newVal === min ? zeroTarget : 0, spring.fast);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      },
      [disabled, getValueFromX, onChange, fillPercent, zeroOffset, zeroTarget, min, max]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging.current) return;
        const newVal = getValueFromX(e.clientX);
        onChange(newVal);
        const newPercent = Math.max(0, Math.min(1, (newVal - min) / (max - min)));
        if (variant === "scrubber") {
          fillPercent.set(newPercent);
        } else {
          animate(fillPercent, newPercent, spring.fast);
        }
        animate(zeroOffset, newVal === min ? zeroTarget : 0, spring.fast);
      },
      [getValueFromX, onChange, variant, fillPercent, zeroOffset, zeroTarget, min, max]
    );

    const handlePointerUp = useCallback(() => {
      dragging.current = false;
      setIsPressed(false);
      setHoverPreview(null);
    }, []);

    // Resize handle drag handlers (direct cursor position)
    const handleResizePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        handleDragging.current = true;
        setIsPressed(true);
        const newVal = getValueFromX(e.clientX);
        onChange(newVal);
        fillPercent.set(Math.max(0, Math.min(1, (newVal - min) / (max - min))));
        animate(zeroOffset, newVal === min ? zeroTarget : 0, spring.fast);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      },
      [disabled, getValueFromX, onChange, fillPercent, zeroOffset, zeroTarget, min, max]
    );

    const handleResizePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!handleDragging.current) return;
        const newVal = getValueFromX(e.clientX);
        onChange(newVal);
        fillPercent.set(Math.max(0, Math.min(1, (newVal - min) / (max - min))));
        animate(zeroOffset, newVal === min ? zeroTarget : 0, spring.fast);
      },
      [getValueFromX, onChange, fillPercent, zeroOffset, zeroTarget, min, max]
    );

    const handleResizePointerUp = useCallback(() => {
      handleDragging.current = false;
      setIsPressed(false);
      setHoverPreview(null);
    }, []);

    const handleRadixChange = useCallback(
      (newValues: number[]) => {
        onChange(newValues[0]);
      },
      [onChange]
    );

    const isActive = isHovered || isFocused;

    return (
      <div
        className="relative w-full touch-none"
        onPointerEnter={() => { if (!disabled) setIsHovered(true); }}
        onPointerLeave={() => {
          if (!disabled) {
            setIsHovered(false);
            setHoverPreview(null);
          }
        }}
        onMouseMove={(e) => {
          if (disabled || dragging.current || handleDragging.current) return;
          computeHoverPreview(e.clientX);
        }}
      >
        {/* Extended hit area — 8px beyond each edge */}
        <div
          className="absolute cursor-ew-resize"
          style={{ left: -8, right: -8, top: 0, bottom: 0 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {/* Hover value tooltip — outside overflow-hidden container */}
        <AnimatePresence>
          {hoverPreview && showHoverTooltip && !isPressed && (
            <motion.div
              key="hover-tooltip"
              className="absolute -translate-x-1/2 pointer-events-none z-20"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4, transition: spring.fast.exit }}
              transition={spring.fast}
              style={{
                left: hoverPreview.cursorX,
                top: -30,
              }}
            >
              <span
                className={cn("text-[12px] text-background tabular-nums whitespace-nowrap bg-foreground px-2 py-1", shape.bg)}
                style={{ fontVariationSettings: fontWeights.medium }}
              >
                {formatValue(hoverPreview.snappedValue)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

      <motion.div
        ref={mergedRef}
        className={cn(
          "relative w-full h-8 select-none touch-none border border-border overflow-hidden outline-offset-2",
          variant === "scrubber"
            ? "flex items-center gap-3 px-4 cursor-ew-resize"
            : "cursor-ew-resize",
          shape.bg,
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        initial={false}
        animate={{
          outline: isFocused ? "1px solid var(--focus-ring, #6B97FF)" : "1px solid transparent",
        }}
        transition={spring.fast}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        {...props}
      >
        {/* Invisible Radix for keyboard nav + a11y */}
        <SliderPrimitive.Root
          value={[value]}
          onValueChange={handleRadixChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute inset-0 opacity-0 pointer-events-none [&_*]:pointer-events-none"
        >
          <SliderPrimitive.Track className="w-full h-full">
            <SliderPrimitive.Range />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-label={label}
            className="block outline-none"
            onFocus={(e) => {
              if (e.currentTarget.matches(":focus-visible")) setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
          />
        </SliderPrimitive.Root>

        {/* Hover preview */}
        <motion.div
          className="absolute inset-y-0 pointer-events-none z-[3]"
          initial={false}
          animate={{
            opacity: hoverPreview && !isPressed ? 1 : 0,
          }}
          transition={{ opacity: { duration: 0.15 } }}
          style={{
            left: hoverPreview ? hoverPreview.left : 0,
            width: hoverPreview ? hoverPreview.width : 0,
            backgroundColor: "color-mix(in srgb, var(--color-accent) 40%, transparent)",
          }}
        />

        {/* Pips: dots layer — z-[1] */}
        {variant === "pips" && (
          <motion.div
            className="absolute inset-0 flex justify-between items-center px-3 pointer-events-none z-[1]"
            style={{ WebkitMaskImage: pipsMaskStyle, maskImage: pipsMaskStyle }}
          >
            {pipSteps.map((pipValue) => {
              const isActivePip = pipValue === value;
              return (
                <div
                  key={pipValue}
                  className="relative flex items-center justify-center"
                  style={{ width: PIP_SIZE, height: PIP_SIZE }}
                >
                  <motion.div
                    className="rounded-full"
                    initial={false}
                    animate={{
                      backgroundColor: isActivePip ? "var(--foreground)" : "var(--muted-foreground)",
                      opacity: isActivePip ? 1 : 0.3,
                    }}
                    transition={spring.fast}
                    style={{ width: PIP_SIZE, height: PIP_SIZE }}
                  />
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Pips: label + value BG layer — z-[2] (occludes dots behind text) */}
        {variant === "pips" && (
          <div className="absolute inset-0 flex items-center px-2 z-[2] pointer-events-none" aria-hidden>
            {label && (
              <span className="text-[13px] px-2 bg-background text-transparent select-none">
                {label}
              </span>
            )}
            <span
              className="text-[13px] tabular-nums ml-auto px-2 bg-background text-transparent select-none"
              style={{ minWidth: `${String(formatValue(max)).length}ch` }}
            >
              {formatValue(value)}
            </span>
          </div>
        )}

        {/* Pips: fill — z-[3] */}
        {variant === "pips" && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 pointer-events-none z-[3]"
            style={{
              width: pipsFillWidthStyle,
              backgroundColor: "var(--active)",
            }}
          />
        )}

        {/* Pips: handle line — z-[3] */}
        {variant === "pips" && (
          <motion.div
            className="absolute rounded-full pointer-events-none z-[3]"
            initial={false}
            animate={{
              top: isActive ? 7 : 8,
              bottom: isActive ? 7 : 8,
              backgroundColor: isFocused
                ? "var(--foreground)"
                : isHovered
                ? "color-mix(in srgb, var(--foreground) 50%, transparent)"
                : "color-mix(in srgb, var(--foreground) 25%, transparent)",
            }}
            transition={spring.fast}
            style={{
              left: pipsHandleLineLeftStyle,
              width: 2,
            }}
          />
        )}

        {/* Pips: label + value text layer — z-[4] */}
        {variant === "pips" && (
          <div className="absolute inset-0 flex items-center px-2 z-[4] pointer-events-none">
            {label && (
              <motion.span
                className="text-[13px] px-2"
                initial={false}
                animate={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
                transition={spring.fast}
              >
                {label}
              </motion.span>
            )}
            <motion.span
              className="text-[13px] tabular-nums ml-auto px-2"
              initial={false}
              animate={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
              transition={spring.fast}
              style={{ minWidth: `${String(formatValue(max)).length}ch`, textAlign: "right" }}
            >
              {formatValue(value)}
            </motion.span>
          </div>
        )}

        {/* Scrubber: fill */}
        {variant === "scrubber" && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: fillWidthStyle,
              backgroundColor: "var(--active)",
            }}
          />
        )}

        {/* Scrubber: handle line */}
        {variant === "scrubber" && (
          <motion.div
            className="absolute rounded-full pointer-events-none z-10"
            initial={false}
            animate={{
              top: isActive ? 7 : 8,
              bottom: isActive ? 7 : 8,
              backgroundColor: isFocused
                ? "var(--foreground)"
                : isHovered
                ? "color-mix(in srgb, var(--foreground) 50%, transparent)"
                : "color-mix(in srgb, var(--foreground) 25%, transparent)",
            }}
            transition={spring.fast}
            style={{
              left: handleLineLeftStyle,
              width: 2,
            }}
          />
        )}

        {/* Scrubber: label */}
        {variant === "scrubber" && label && (
          <motion.span
            className="text-[13px] shrink-0 z-10"
            initial={false}
            animate={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
            transition={spring.fast}
          >
            {label}
          </motion.span>
        )}

        {/* Scrubber: flex-1 spacer + value */}
        {variant === "scrubber" && (
          <>
            <div className="flex-1" />
            <motion.span
              className="text-[13px] shrink-0 tabular-nums text-right z-10"
              initial={false}
              animate={{ color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}
              transition={spring.fast}
              style={{ minWidth: `${String(formatValue(max)).length}ch` }}
            >
              {formatValue(value)}
            </motion.span>
          </>
        )}

        {/* Resize handle (scrubber only) */}
        {variant === "scrubber" && (
          <motion.div
            className="absolute top-0 bottom-0 w-2 cursor-ew-resize z-20"
            style={{ left: handleLeftStyle }}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
          />
        )}
      </motion.div>
      </div>
    );
  }
);

SliderComfortable.displayName = "SliderComfortable";

export { Slider, SliderComfortable };
export type { SliderProps, SliderValue, ValuePosition, SliderComfortableProps };
