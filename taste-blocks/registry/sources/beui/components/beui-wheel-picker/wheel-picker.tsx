"use client";

import { useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createTickPlayer } from "../../lib/taste-blocks/beui/tick-sound";
import { cn } from "../../lib/taste-blocks/beui/utils";

export type WheelPickerOption = string | { label: string; value: string };

export interface WheelPickerProps {
  options: WheelPickerOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Rows visible through the window, odd. More = flatter curve. Default 5. */
  visibleCount?: number;
  /** Row height in px. Default 36. */
  itemHeight?: number;
  disabled?: boolean;
  /** Play a short tick each time the selected value changes. Default false. */
  sound?: boolean;
  className?: string;
  "aria-label"?: string;
}

const DEG = Math.PI / 180;
// Physics constants, tuned for an iOS-like flick rather than reused from the
// shared spring tokens: the wheel coasts in whole-row units and springs to an
// integer detent, which a layout spring can't express cleanly.
const DECELERATION = 0.00042; // rows per ms², how fast a flick bleeds off (lower = freer)
const MAX_VELOCITY = 0.18; // rows per ms, caps a hard fling
const VELOCITY_WINDOW = 90; // ms of recent drag to average a release velocity over
const WHEEL_SENS = 0.012; // rows per pixel of wheel delta
const WHEEL_SETTLE = 110; // ms of wheel idle before snapping to a row
const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
// Overshoots the target by a few percent then settles — the little spring
// bounce as a row snaps home. `BACK` sets how far it drifts past.
const BACK = 1.35;
const easeOutBack = (p: number) =>
  1 + (BACK + 1) * (p - 1) ** 3 + BACK * (p - 1) ** 2;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(v, hi));

function optionValue(option: WheelPickerOption) {
  return typeof option === "string" ? option : option.value;
}
function optionLabel(option: WheelPickerOption) {
  return typeof option === "string" ? option : option.label;
}

export function WheelPicker({
  options,
  value,
  defaultValue,
  onValueChange,
  visibleCount = 5,
  itemHeight = 36,
  disabled = false,
  sound = false,
  className,
  "aria-label": ariaLabel = "Option picker",
}: WheelPickerProps) {
  const reduce = useReducedMotion() ?? false;
  const controlled = value !== undefined;
  const last = options.length - 1;

  const indexOf = useCallback(
    (v: string | undefined) => {
      const i = options.findIndex((o) => optionValue(o) === v);
      return i < 0 ? 0 : i;
    },
    [options],
  );

  const [internal, setInternal] = useState(() => defaultValue ?? value);
  const currentValue = controlled ? value : internal;
  const [grabbing, setGrabbing] = useState(false);

  // Cylinder geometry. Each row spans `itemAngle`; `radius` seats the rows on
  // the drum; rows past `hideBeyond` sit behind the horizon and are dropped.
  const { itemAngle, radius, height, hideBeyond } = useMemo(() => {
    const rowsEachSide = Math.max(1, Math.floor(visibleCount / 2));
    const cutoff = rowsEachSide + 1;
    const angle = 90 / cutoff;
    const r = itemHeight / Math.tan(angle * DEG);
    return {
      itemAngle: angle,
      radius: r,
      hideBeyond: cutoff,
      height: Math.round(
        2 * r * Math.sin(rowsEachSide * angle * DEG) + itemHeight,
      ),
    };
  }, [visibleCount, itemHeight]);

  const container = useRef<HTMLDivElement>(null);
  const drumRef = useRef<HTMLUListElement>(null);
  const bandRef = useRef<HTMLUListElement>(null);
  // Scroll position measured in rows (a float index). One source of truth for
  // both layers: the drum rotates by `itemAngle·scroll`, the crisp band slides
  // by `itemHeight·scroll`.
  const scroll = useRef(indexOf(currentValue));
  const raf = useRef(0);
  const emitted = useRef(currentValue);
  const tickPlayer = useRef<ReturnType<typeof createTickPlayer> | null>(null);
  const lastTick = useRef(indexOf(currentValue));

  const paint = useCallback(
    (s: number) => {
      const drum = drumRef.current;
      const band = bandRef.current;
      if (drum) {
        drum.style.transform = `translateZ(${-radius}px) rotateX(${itemAngle * s}deg)`;
        for (const node of Array.from(drum.children)) {
          const li = node as HTMLLIElement;
          const i = Number(li.dataset.index);
          const want = Math.abs(i - s) > hideBeyond ? "hidden" : "visible";
          // Write only on change — an unconditional write every frame thrashes
          // style recalc and is what made the drag feel draggy on mobile.
          if (li.style.visibility !== want) li.style.visibility = want;
        }
      }
      // The band is the SAME drum, clipped to the centre row — driven by the
      // identical transform so the crisp copy sits exactly on the dimmed one,
      // with no parallax ghost as rows cross the window. It needs the same
      // horizon cull, or the row on the back of the drum bleeds into the front.
      if (band) {
        band.style.transform = `translateZ(${-radius}px) rotateX(${itemAngle * s}deg)`;
        for (const node of Array.from(band.children)) {
          const li = node as HTMLLIElement;
          const i = Number(li.dataset.index);
          const want = Math.abs(i - s) > hideBeyond ? "hidden" : "visible";
          if (li.style.visibility !== want) li.style.visibility = want;
        }
      }
    },
    [radius, itemAngle, hideBeyond],
  );

  const getPlayer = useCallback(() => {
    if (!tickPlayer.current) tickPlayer.current = createTickPlayer();
    return tickPlayer.current;
  }, []);

  const emit = useCallback(
    (i: number) => {
      const v = optionValue(options[clamp(i, 0, last)]);
      if (v === emitted.current) return;
      emitted.current = v;
      // Reduced motion has no drum/glide path to tick from — it's an
      // onClick straight into emit, so the tick lives here instead.
      if (sound && reduce) getPlayer().play();
      if (!controlled) setInternal(v);
      onValueChange?.(v);
    },
    [options, last, controlled, onValueChange, sound, reduce, getPlayer],
  );

  // Drum path: fires a tick whenever the nearest row changes, independent of
  // `emit` (which only fires on settle during a glide/fling, not per row
  // crossed). Gated on `!reduce` since the reduced render never calls this.
  const maybeTick = useCallback(
    (pos: number) => {
      const row = clamp(Math.round(pos), 0, last);
      if (!sound || reduce) {
        lastTick.current = row;
        return;
      }
      if (row === lastTick.current) return;
      lastTick.current = row;
      getPlayer().play();
    },
    [sound, reduce, last, getPlayer],
  );

  const stop = useCallback(() => cancelAnimationFrame(raf.current), []);

  // Ease `scroll` from where it is to an integer detent over `duration`. The
  // easing may overshoot (spring bounce) before it resolves exactly on `to`.
  const glide = useCallback(
    (
      to: number,
      duration: number,
      ease: (p: number) => number = easeOutCubic,
    ) => {
      stop();
      const from = scroll.current;
      const dist = to - from;
      if (!dist || duration <= 0) {
        scroll.current = to;
        paint(to);
        maybeTick(to);
        emit(to);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const p = (now - start) / duration;
        if (p >= 1) {
          scroll.current = to;
          paint(to);
          maybeTick(to);
          emit(to);
          return;
        }
        scroll.current = from + dist * ease(p);
        paint(scroll.current);
        maybeTick(scroll.current);
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [stop, paint, emit, maybeTick],
  );

  // Project where a flick of `velocity` (rows/ms) coasts to, snap to a row.
  const fling = useCallback(
    (velocity: number) => {
      const from = scroll.current;
      if (from < 0 || from > last) {
        glide(clamp(Math.round(from), 0, last), 260); // rubber-band back
        return;
      }
      const dir = Math.sign(velocity);
      const coast = ((velocity * velocity) / (2 * DECELERATION)) * dir;
      const to = clamp(Math.round(from + coast), 0, last);
      // Long, spring-tipped settle so a hard flick reads as free momentum
      // coasting to rest with a gentle bounce, never a clipped stop.
      const duration = clamp(
        Math.sqrt(Math.abs(to - from)) * 300 + 240,
        280,
        1700,
      );
      glide(to, duration, easeOutBack);
    },
    [glide, last],
  );

  const step = useCallback(
    (by: number) =>
      glide(clamp(Math.round(scroll.current) + by, 0, last), 300, easeOutBack),
    [glide, last],
  );

  // Drag: track recent points for a release velocity; rubber-band past the ends.
  const drag = useRef<{
    y: number;
    scroll: number;
    pts: [number, number][];
  } | null>(null);
  // Coalesce touch/pointer moves to one paint per animation frame — raw move
  // events fire several times per frame (and off-frame) on high-refresh
  // screens, and painting each one is what made the drag feel choppy.
  const dragFrame = useRef(0);
  const latestY = useRef(0);
  // Shared drag core, driven by a Y coordinate from either a mouse pointer or a
  // native touch. Touch is bound with non-passive listeners in the effect below
  // so the move can preventDefault the page scroll — React's synthetic touch
  // events are passive and can't, which is why finger-drag did nothing on
  // mobile.
  const beginDrag = useCallback(
    (y: number) => {
      stop();
      if (sound) getPlayer().prepare();
      setGrabbing(true);
      drag.current = {
        y,
        scroll: scroll.current,
        pts: [[y, performance.now()]],
      };
    },
    [stop, sound, getPlayer],
  );
  const moveDrag = useCallback(
    (y: number) => {
      const d = drag.current;
      if (!d) return;
      // Record every sample for an accurate release velocity, but only render
      // the newest position once per frame.
      latestY.current = y;
      d.pts.push([y, performance.now()]);
      if (d.pts.length > 8) d.pts.shift();
      if (dragFrame.current) return;
      dragFrame.current = requestAnimationFrame(() => {
        dragFrame.current = 0;
        const dd = drag.current;
        if (!dd) return;
        let next = dd.scroll + (dd.y - latestY.current) / itemHeight;
        if (next < 0) next *= 0.3;
        else if (next > last) next = last + (next - last) * 0.3;
        scroll.current = next;
        paint(next);
        maybeTick(next);
        emit(Math.round(clamp(next, 0, last)));
      });
    },
    [itemHeight, last, paint, emit, maybeTick],
  );
  const endDrag = useCallback(() => {
    const d = drag.current;
    if (!d) return;
    if (dragFrame.current) {
      cancelAnimationFrame(dragFrame.current);
      dragFrame.current = 0;
    }
    drag.current = null;
    setGrabbing(false);
    // Average velocity over the last `VELOCITY_WINDOW` ms of movement rather
    // than the final two samples — a single noisy frame otherwise makes an
    // even flick feel like it caught or slipped.
    const pts = d.pts;
    let v = 0;
    if (pts.length > 1) {
      const latest = pts[pts.length - 1];
      let ref = pts[0];
      for (const p of pts) {
        if (latest[1] - p[1] <= VELOCITY_WINDOW) {
          ref = p;
          break;
        }
      }
      const dt = latest[1] - ref[1];
      if (dt > 0) {
        const raw = (ref[0] - latest[0]) / itemHeight / dt;
        v = clamp(raw, -MAX_VELOCITY, MAX_VELOCITY);
      }
    }
    fling(v);
  }, [itemHeight, fling]);

  // Mouse / pen only — touch runs through the native listeners in the effect.
  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || reduce || event.pointerType === "touch") return;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic accessibility input may not own an active pointer.
      }
      beginDrag(event.clientY);
    },
    [disabled, reduce, beginDrag],
  );
  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") return;
      moveDrag(event.clientY);
    },
    [moveDrag],
  );
  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      endDrag();
    },
    [endDrag],
  );

  // Wheel drives `scroll` continuously — like a drag — then snaps once it goes
  // idle. Firing a fresh eased step per notch instead stacks overlapping
  // animations that keep interrupting each other, which read as lag.
  const wheelSnap = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onWheel = useCallback(
    (event: globalThis.WheelEvent) => {
      // Native (non-passive) so preventDefault actually stops the page from
      // scrolling behind the wheel — React's synthetic wheel listener is
      // passive, so a handler on the element cannot cancel the scroll.
      if (disabled || reduce) return;
      event.preventDefault();
      if (sound) getPlayer().prepare();
      stop();
      const px = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      const next = clamp(scroll.current + px * WHEEL_SENS, 0, last);
      scroll.current = next;
      paint(next);
      maybeTick(next);
      emit(Math.round(next));
      if (wheelSnap.current) clearTimeout(wheelSnap.current);
      wheelSnap.current = setTimeout(() => {
        glide(clamp(Math.round(scroll.current), 0, last), 240, easeOutBack);
      }, WHEEL_SETTLE);
    },
    [
      disabled,
      reduce,
      sound,
      last,
      paint,
      emit,
      stop,
      glide,
      maybeTick,
      getPlayer,
    ],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const at = Math.round(scroll.current);
      const map: Record<string, number> = {
        ArrowUp: -1,
        ArrowDown: 1,
        Home: -at,
        End: last - at,
      };
      if (event.key in map) {
        event.preventDefault();
        if (sound) getPlayer().prepare();
        step(map[event.key]);
      }
    },
    [disabled, sound, last, step, getPlayer],
  );

  // Paint the starting frame, and follow controlled/value changes from outside
  // unless a gesture is mid-flight.
  useEffect(() => {
    if (drag.current) return;
    const target = indexOf(currentValue);
    emitted.current = currentValue;
    if (Math.abs(Math.round(scroll.current) - target) < 0.001) {
      paint(scroll.current);
      return;
    }
    glide(target, 260);
  }, [currentValue, indexOf, paint, glide]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(dragFrame.current);
      if (wheelSnap.current) clearTimeout(wheelSnap.current);
      tickPlayer.current?.dispose();
    },
    [],
  );

  // Native touch + wheel listeners, bound non-passively so touchmove and wheel
  // can block the page from scrolling while the wheel spins. React's synthetic
  // touch/wheel handlers are passive, so preventDefault there is a no-op and the
  // gesture scrolls the page instead of driving the drum.
  useEffect(() => {
    const el = container.current;
    if (!el || reduce || disabled) return;
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) beginDrag(t.clientY);
    };
    const onMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || !drag.current) return;
      e.preventDefault();
      moveDrag(t.clientY);
    };
    const onEnd = () => endDrag();
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
      el.removeEventListener("wheel", onWheel);
    };
  }, [reduce, disabled, beginDrag, moveDrag, endDrag, onWheel]);

  const maskFade =
    "[mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent)]";

  if (options.length === 0) return null;

  if (reduce) {
    const pad = (height - itemHeight) / 2;
    return (
      <div
        role="group"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border bg-card",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
        style={{ height }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-border border-y bg-foreground/[0.04]"
          style={{ height: itemHeight }}
        />
        <ul
          className={cn(
            "h-full snap-y snap-mandatory overflow-y-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            maskFade,
          )}
          style={{ paddingTop: pad, paddingBottom: pad }}
        >
          {options.map((option) => {
            const v = optionValue(option);
            return (
              <li key={v} className="snap-center">
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={v === currentValue}
                  onClick={() => emit(options.indexOf(option))}
                  className={cn(
                    "flex w-full items-center justify-center font-medium",
                    v === currentValue
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                  style={{ height: itemHeight }}
                >
                  {optionLabel(option)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div
      ref={container}
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={indexOf(currentValue)}
      aria-valuetext={optionLabel(options[indexOf(currentValue)])}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "relative touch-none select-none overflow-hidden rounded-2xl border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-foreground/20",
        grabbing ? "cursor-grabbing" : "cursor-grab",
        disabled && "pointer-events-none opacity-50",
        maskFade,
        className,
      )}
      style={{ height, perspective: 1000 }}
    >
      {/* Curved drum of dimmed rows. */}
      <ul
        ref={drumRef}
        aria-hidden
        className="absolute inset-x-0 top-1/2 m-0 h-0 list-none p-0 [backface-visibility:hidden] [transform-style:preserve-3d] [will-change:transform]"
      >
        {options.map((option, i) => (
          <li
            key={optionValue(option)}
            data-index={i}
            className="absolute inset-x-0 flex items-center justify-center font-medium text-muted-foreground"
            style={{
              top: -itemHeight / 2,
              height: itemHeight,
              transform: `rotateX(${-itemAngle * i}deg) translateZ(${radius}px)`,
            }}
          >
            {optionLabel(option)}
          </li>
        ))}
      </ul>

      {/* Center band: the very same drum, clipped to one row and drawn crisp.
          Its own perspective, centred on the container middle, matches the main
          drum's projection so the two copies register exactly. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-md bg-foreground/[0.04]"
        style={{ height: itemHeight, perspective: 1000 }}
      >
        <ul
          ref={bandRef}
          aria-hidden
          className="absolute inset-x-0 top-1/2 m-0 h-0 list-none p-0 [backface-visibility:hidden] [transform-style:preserve-3d] [will-change:transform]"
        >
          {options.map((option, i) => (
            <li
              key={optionValue(option)}
              data-index={i}
              className="absolute inset-x-0 flex items-center justify-center font-medium text-foreground"
              style={{
                top: -itemHeight / 2,
                height: itemHeight,
                transform: `rotateX(${-itemAngle * i}deg) translateZ(${radius}px)`,
              }}
            >
              {optionLabel(option)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
