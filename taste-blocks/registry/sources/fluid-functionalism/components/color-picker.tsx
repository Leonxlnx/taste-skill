"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { Popover } from "@base-ui/react/popover";
import { Menu } from "@base-ui/react/menu";
import { NumberField } from "@base-ui/react/number-field";
import { cn } from "../lib/utils";
import { spring } from "../lib/springs";
import { fontWeights } from "../lib/font-weight";
import { useShape, shapeMap } from "../lib/shape-context";
import { useSurface, SurfaceProvider } from "../lib/surface-context";
import { surfaceClasses } from "../lib/surface-classes";
import { useIcon } from "../lib/icon-context";
import { useProximityHover } from "../hooks/use-proximity-hover";
import { Elevated } from "../lib/elevated";
import { Slider } from "./slider";
import { Tooltip } from "./tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

// Allows consumers (e.g. the /demo carousel) to portal popups inside a
// CSS-scaled ancestor so menu/popover layers visually scale with the picker.
const ColorPickerPortalContainerContext = createContext<HTMLElement | null>(null);

function ColorPickerPortalContainer({
  value,
  children,
}: {
  value: HTMLElement | null;
  children: ReactNode;
}) {
  return (
    <ColorPickerPortalContainerContext.Provider value={value}>
      {children}
    </ColorPickerPortalContainerContext.Provider>
  );
}

interface ParsedColor {
  // HSV (canonical, 0..360 / 0..1 / 0..1)
  h: number;
  s: number;
  v: number;
  a: number;
  // sRGB 0..255
  r: number;
  g: number;
  b: number;
  // Formatted strings
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
}

interface ColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, parsed: ParsedColor) => void;
  format?: ColorFormat;
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  swatches?: string[];
  hideEyedropper?: boolean;
  /** Controls the format dropdown's open state. When provided, the dropdown
   *  is fully controlled and ignores user toggles. */
  formatOpen?: boolean;
  /** Initial open state for the format dropdown (uncontrolled). */
  defaultFormatOpen?: boolean;
}

interface ColorPickerPopoverProps extends ColorPickerProps {
  triggerLabel?: string;
  triggerLabelPosition?: "left" | "right";
  triggerShowValue?: boolean;
  triggerShowRemove?: boolean;
  onTriggerRemove?: () => void;
  triggerClassName?: string;
  /** Controls the popover's open state. When provided, the popover is fully
   *  controlled and ignores trigger clicks. */
  open?: boolean;
  /** Initial open state for the popover (uncontrolled). */
  defaultOpen?: boolean;
  /** Called when the open state would change (fires even when controlled). */
  onOpenChange?: (open: boolean) => void;
}

interface ColorSwatchProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "color"> {
  color: string;
  size?: number;
  selected?: boolean;
}

// ---------------------------------------------------------------------------
// Color math (no deps)
// ---------------------------------------------------------------------------

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function clamp255(n: number) {
  return Math.max(0, Math.min(255, n));
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh < 1) { r = c; g = x; b = 0; }
  else if (hh < 2) { r = x; g = c; b = 0; }
  else if (hh < 3) { r = 0; g = c; b = x; }
  else if (hh < 4) { r = 0; g = x; b = c; }
  else if (hh < 5) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const m = v - c;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hh < 1) { r = c; g = x; }
  else if (hh < 2) { r = x; g = c; }
  else if (hh < 3) { g = c; b = x; }
  else if (hh < 4) { g = x; b = c; }
  else if (hh < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return clamp01(v) * 255;
}

function linearRgbToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

function oklabToLinearRgb(L: number, a: number, b: number): { r: number; g: number; b: number } {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r:  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

function rgbToOklch(r: number, g: number, b: number): { L: number; C: number; H: number } {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const lab = linearRgbToOklab(lr, lg, lb);
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let H = Math.atan2(lab.b, lab.a) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { L: lab.L, C, H };
}

function oklchToRgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
  const a = C * Math.cos(H * Math.PI / 180);
  const b = C * Math.sin(H * Math.PI / 180);
  const lin = oklabToLinearRgb(L, a, b);
  // Clamp to sRGB silently (option a from plan)
  return {
    r: clamp255(linearToSrgb(lin.r)),
    g: clamp255(linearToSrgb(lin.g)),
    b: clamp255(linearToSrgb(lin.b)),
  };
}

function to2hex(n: number): string {
  return Math.round(clamp255(n)).toString(16).padStart(2, "0");
}

function rgbToHexStr(r: number, g: number, b: number, a: number): string {
  if (a >= 1) return `#${to2hex(r)}${to2hex(g)}${to2hex(b)}`;
  return `#${to2hex(r)}${to2hex(g)}${to2hex(b)}${to2hex(a * 255)}`;
}

function expandShortHex(h: string): string {
  if (h.length === 3) return h.split("").map((c) => c + c).join("");
  if (h.length === 4) return h.split("").map((c) => c + c).join("");
  return h;
}

function parseHex(input: string): { r: number; g: number; b: number; a: number } | null {
  const m = input.trim().match(/^#?([0-9a-fA-F]{3,8})$/);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3 || h.length === 4) h = expandShortHex(h);
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: 1,
    };
  }
  if (h.length === 8) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: parseInt(h.slice(6, 8), 16) / 255,
    };
  }
  return null;
}

function parseColor(input: string): { r: number; g: number; b: number; a: number } | null {
  const s = input.trim();
  if (!s) return null;
  if (s.startsWith("#") || /^[0-9a-fA-F]{3,8}$/.test(s)) {
    return parseHex(s);
  }
  const rgbM = s.match(/^rgba?\(\s*([^)]+)\)$/i);
  if (rgbM) {
    const parts = rgbM[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    let a = 1;
    if (parts[3] !== undefined) {
      a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    }
    if ([r, g, b, a].some(Number.isNaN)) return null;
    return { r: clamp255(r), g: clamp255(g), b: clamp255(b), a: clamp01(a) };
  }
  const hslM = s.match(/^hsla?\(\s*([^)]+)\)$/i);
  if (hslM) {
    const parts = hslM[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const h = parseFloat(parts[0]);
    const sat = parts[1].endsWith("%") ? parseFloat(parts[1]) / 100 : parseFloat(parts[1]);
    const l = parts[2].endsWith("%") ? parseFloat(parts[2]) / 100 : parseFloat(parts[2]);
    let a = 1;
    if (parts[3] !== undefined) {
      a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    }
    if ([h, sat, l, a].some(Number.isNaN)) return null;
    const rgb = hslToRgb(h, clamp01(sat), clamp01(l));
    return { r: clamp255(rgb.r), g: clamp255(rgb.g), b: clamp255(rgb.b), a: clamp01(a) };
  }
  const oklchM = s.match(/^oklch\(\s*([^)]+)\)$/i);
  if (oklchM) {
    const parts = oklchM[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const L = parts[0].endsWith("%") ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
    const C = parseFloat(parts[1]);
    const H = parseFloat(parts[2]);
    let a = 1;
    if (parts[3] !== undefined) {
      a = parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    }
    if ([L, C, H, a].some(Number.isNaN)) return null;
    const rgb = oklchToRgb(clamp01(L), Math.max(0, C), H);
    return { r: clamp255(rgb.r), g: clamp255(rgb.g), b: clamp255(rgb.b), a: clamp01(a) };
  }
  return null;
}

// Browser-assisted fallback for color strings the manual parser doesn't cover
// (named CSS colors like "red" / "tomato", etc.). A canvas 2d context
// round-trips any valid CSS color through `fillStyle`, which serializes to a
// hex or rgba() string that parseColor understands. Must only be called from
// event handlers or effects — never at module scope or during render — so SSR
// stays safe.
let cssColorCtx: CanvasRenderingContext2D | null = null;

function resolveCssColor(input: string): { r: number; g: number; b: number; a: number } | null {
  const direct = parseColor(input);
  if (direct) return direct;
  const s = input.trim();
  if (!s || typeof document === "undefined") return null;
  if (!cssColorCtx) {
    cssColorCtx = document.createElement("canvas").getContext("2d");
    if (!cssColorCtx) return null;
  }
  const ctx = cssColorCtx;
  // An invalid color assignment leaves fillStyle untouched, so round-trip from
  // two different starting values to detect rejection.
  ctx.fillStyle = "#000000";
  ctx.fillStyle = s;
  const first = String(ctx.fillStyle);
  ctx.fillStyle = "#ffffff";
  ctx.fillStyle = s;
  const second = String(ctx.fillStyle);
  if (first !== second) return null;
  return parseColor(first);
}

function buildParsed(h: number, s: number, v: number, a: number): ParsedColor {
  const { r, g, b } = hsvToRgb(h, s, v);
  const hsl = rgbToHsl(r, g, b);
  const oklch = rgbToOklch(r, g, b);
  const hex = rgbToHexStr(r, g, b, a);
  const rgbStr = a >= 1
    ? `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    : `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(3))})`;
  const hslStr = a >= 1
    ? `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`
    : `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%, ${Number(a.toFixed(3))})`;
  const oklchStr = a >= 1
    ? `oklch(${(oklch.L * 100).toFixed(1)}% ${oklch.C.toFixed(3)} ${oklch.H.toFixed(1)})`
    : `oklch(${(oklch.L * 100).toFixed(1)}% ${oklch.C.toFixed(3)} ${oklch.H.toFixed(1)} / ${Number(a.toFixed(3))})`;
  return {
    h, s, v, a,
    r: Math.round(r), g: Math.round(g), b: Math.round(b),
    hex, rgb: rgbStr, hsl: hslStr, oklch: oklchStr,
  };
}

function formatValueByFormat(parsed: ParsedColor, fmt: ColorFormat): string {
  switch (fmt) {
    case "hex": return parsed.hex;
    case "rgb": return parsed.rgb;
    case "hsl": return parsed.hsl;
    case "oklch": return parsed.oklch;
  }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PANEL_WIDTH = 280;
const SQUARE_HEIGHT = 156;
const CHECKER_BG: CSSProperties = {
  backgroundImage:
    "conic-gradient(var(--checker-a) 0 25%, var(--checker-b) 0 50%, var(--checker-a) 0 75%, var(--checker-b) 0)",
  backgroundSize: "8px 8px",
};

// ---------------------------------------------------------------------------
// SaturationSquare
// ---------------------------------------------------------------------------

interface SaturationSquareProps {
  h: number;
  s: number;
  v: number;
  onChange: (s: number, v: number) => void;
}

function SaturationSquare({ h, s, v, onChange }: SaturationSquareProps) {
  const ref = useRef<HTMLDivElement>(null);
  // State (not a ref): this gates the ghost hover cursor during render, and a
  // ref mutation wouldn't re-render, letting the ghost stick around.
  const [dragging, setDragging] = useState(false);
  const hasMoved = useRef(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const shape = useShape();

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp01((clientX - rect.left) / rect.width);
      const y = clamp01((clientY - rect.top) / rect.height);
      onChange(x, 1 - y);
    },
    [onChange]
  );

  const updateCursorPos = useCallback((clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorPos({
      x: clamp01((clientX - rect.left) / rect.width) * 100,
      y: clamp01((clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      setDragging(true);
      hasMoved.current = false;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      updateCursorPos(e.clientX, e.clientY);
      if (!dragging) return;
      hasMoved.current = true;
      updateFromPointer(e.clientX, e.clientY);
    },
    [dragging, updateFromPointer, updateCursorPos]
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
    hasMoved.current = false;
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      let nextS = s, nextV = v, handled = true;
      if (e.key === "ArrowLeft") nextS = clamp01(s - step);
      else if (e.key === "ArrowRight") nextS = clamp01(s + step);
      else if (e.key === "ArrowUp") nextV = clamp01(v + step);
      else if (e.key === "ArrowDown") nextV = clamp01(v - step);
      else handled = false;
      if (handled) {
        e.preventDefault();
        onChange(nextS, nextV);
      }
    },
    [onChange, s, v]
  );

  const { r, g, b } = hsvToRgb(h, s, v);
  const thumbColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  return (
    <div
      ref={ref}
      role="application"
      aria-label="Saturation and brightness"
      tabIndex={0}
      onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setFocused(true); }}
      onBlur={() => setFocused(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setCursorPos(null);
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "relative w-full select-none touch-none cursor-none outline-none",
        shape.bg
      )}
      style={{
        height: SQUARE_HEIGHT,
        boxShadow: focused ? "0 0 0 2px var(--focus-ring, #6B97FF)" : undefined,
      }}
    >
      <div
        dir="ltr"
        className={cn(
          "absolute inset-0 overflow-hidden",
          shape.bg === "rounded-[20px]" ? "rounded-2xl" : shape.bg
        )}
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))`,
        }}
      />
      <motion.div
        className="absolute pointer-events-none rounded-full"
        initial={false}
        animate={{
          left: `${s * 100}%`,
          top: `${(1 - v) * 100}%`,
          width: 18,
          height: 18,
        }}
        transition={{ duration: 0 }}
        style={{
          transform: "translate(-50%, -50%)",
          border: "1px solid white",
          boxShadow: "0 0 0 1px rgba(0,0,0,1)",
          backgroundColor: thumbColor,
        }}
      />
      {hovered && !dragging && cursorPos && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
            width: 18,
            height: 18,
            transform: "translate(-50%, -50%)",
            border: "2px solid rgba(255, 255, 255, 0.55)",
            boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)",
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HueSlider
// ---------------------------------------------------------------------------

function HueSlider({ h, onChange }: { h: number; onChange: (h: number) => void }) {
  const hueColor = `hsl(${h}, 100%, 50%)`;
  return (
    <Slider
      value={h}
      onChange={(v) => onChange(typeof v === "number" ? v : v[0])}
      min={0}
      max={360}
      step={1}
      showValue={false}
      hideFill
      thumbColor={hueColor}
      thumbBorderColor="rgba(255,255,255,0.9)"
      trackStyle={{
        background:
          "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))",
        borderColor: "transparent",
      }}
      aria-label="Hue"
    />
  );
}

// ---------------------------------------------------------------------------
// AlphaSlider
// ---------------------------------------------------------------------------

function AlphaSlider({
  a,
  solidColor,
  solidR,
  solidG,
  solidB,
  onChange,
}: {
  a: number;
  solidColor: string;
  solidR: number;
  solidG: number;
  solidB: number;
  onChange: (a: number) => void;
}) {
  // Use color-aware transparent stop (same hue, alpha 0) so the gradient stays
  // chromatically consistent and reaches fully opaque at 100% with no edge gap.
  const transparentColor = `rgba(${solidR}, ${solidG}, ${solidB}, 0)`;
  return (
    <Slider
      value={Math.round(a * 100)}
      onChange={(v) => onChange((typeof v === "number" ? v : v[0]) / 100)}
      min={0}
      max={100}
      step={1}
      showValue={false}
      hideFill
      thumbColor={solidColor}
      thumbBorderColor="rgba(255,255,255,0.9)"
      trackStyle={{
        backgroundImage: `linear-gradient(to right, ${transparentColor} 0%, ${solidColor} 98%), conic-gradient(var(--checker-a) 0 25%, var(--checker-b) 0 50%, var(--checker-a) 0 75%, var(--checker-b) 0)`,
        backgroundSize: "100% 100%, 8px 8px",
        borderWidth: 0,
      }}
      aria-label="Alpha"
    />
  );
}

// ---------------------------------------------------------------------------
// FormatDropdown
//
// Built on Base UI's Menu primitive, which owns trigger wiring, positioning
// (anchor tracking + collision flipping — the old hand-rolled version computed
// coordinates once on open and detached from the trigger on scroll),
// dismissal, roving highlight, and typeahead. Menu.RadioGroup/RadioItem carry
// the radio semantics. This layer keeps the proximity-hover
// overlays and the spring open/close animation (actionsRef deferred unmount —
// the same verified pattern as select.tsx / dropdown.tsx).
// ---------------------------------------------------------------------------

const FORMAT_LABELS: Record<ColorFormat, string> = {
  hex: "HEX",
  rgb: "RGB",
  hsl: "HSL",
  oklch: "OKLCH",
};

const FORMATS = ["hex", "rgb", "hsl", "oklch"] as const;

// Popup surfaces opt out of the global pill/rounded shape — same rationale as
// the Dropdown component (pill radii distort perceived padding at this scale).
const menuShape = shapeMap.rounded;

interface FormatMenuContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
  activeIndex: number | null;
  checkedIndex?: number;
}

const FormatMenuContext = createContext<FormatMenuContextValue | null>(null);

function FormatItem({
  index,
  value,
  label,
  checked,
}: {
  index: number;
  value: ColorFormat;
  label: string;
  checked: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const menuCtx = useContext(FormatMenuContext);
  const shape = useShape();

  useEffect(() => {
    menuCtx?.registerItem(index, ref.current);
    return () => menuCtx?.registerItem(index, null);
  }, [index, menuCtx]);

  const isActive = menuCtx?.activeIndex === index;

  return (
    <Menu.RadioItem
      value={value}
      label={label}
      closeOnClick
      render={
        <div
          ref={ref}
          data-proximity-index={index}
          className={cn(
            `relative z-10 flex items-center px-3 py-2 text-[13px] cursor-pointer outline-none`,
            shape.item
          )}
        />
      }
    >
      <span className="inline-grid">
        <span
          className="col-start-1 row-start-1 invisible"
          style={{ fontVariationSettings: fontWeights.semibold }}
          aria-hidden="true"
        >
          {label}
        </span>
        <span
          className={cn(
            "col-start-1 row-start-1 transition-[color,font-variation-settings] duration-80",
            isActive || checked ? "text-foreground" : "text-muted-foreground"
          )}
          style={{
            fontVariationSettings: checked
              ? fontWeights.semibold
              : fontWeights.normal,
          }}
        >
          {label}
        </span>
      </span>
    </Menu.RadioItem>
  );
}

function FormatDropdown({
  value,
  onChange,
  open: openProp,
  defaultOpen = false,
}: {
  value: ColorFormat;
  onChange: (f: ColorFormat) => void;
  open?: boolean;
  defaultOpen?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const actionsRef = useRef<{ unmount: () => void; close: () => void } | null>(null);
  const shape = useShape();
  const portalContainer = useContext(ColorPickerPortalContainerContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const ChevronDownIcon = useIcon("chevron-down");

  const {
    activeIndex,
    setActiveIndex,
    itemRects,
    sessionRef,
    handlers,
    registerItem,
    measureItems,
  } = useProximityHover(containerRef);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Release Base UI's deferred unmount once the exit tween has played.
  // onAnimationComplete on the motion.div is the primary signal; this timeout
  // is a fallback for throttled/background tabs where rAF-driven animation
  // callbacks can stall (spring.fast.exit is 60ms — 120ms covers it with
  // margin without holding the portal open perceptibly).
  useEffect(() => {
    if (open) return;
    const id = setTimeout(() => actionsRef.current?.unmount(), 120);
    return () => clearTimeout(id);
  }, [open]);

  // Measure items once the popup has mounted.
  useEffect(() => {
    if (!open) return;
    // Double rAF: first waits for React commit, second for layout
    let inner: number;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        measureItems();
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open, measureItems]);

  const checkedIndex = FORMATS.indexOf(value);
  const activeRect = activeIndex !== null ? itemRects[activeIndex] : null;
  const checkedRect = checkedIndex !== -1 ? itemRects[checkedIndex] : null;
  const focusRect = focusedIndex !== null ? itemRects[focusedIndex] : null;
  const isHoveringOther = activeIndex !== null && activeIndex !== checkedIndex;

  const menuCtx = useMemo(
    () => ({ registerItem, activeIndex, checkedIndex }),
    [registerItem, activeIndex, checkedIndex]
  );

  return (
    <Menu.Root
      open={open}
      onOpenChange={(next) => {
        if (!isControlled) setInternalOpen(next);
      }}
      actionsRef={actionsRef}
      // Non-modal: the page keeps scrolling and the Positioner tracks the
      // anchor, so the popup follows its trigger instead of detaching.
      modal={false}
    >
      <Menu.Trigger
        className={cn(
          "flex items-center justify-between gap-2 h-9 px-3 text-[13px] bg-transparent hover:bg-hover hover:text-foreground transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)] cursor-pointer",
          open ? "bg-active text-foreground" : "text-muted-foreground active:bg-active",
          shape.input
        )}
        style={{ fontVariationSettings: fontWeights.medium }}
      >
        <span>{FORMAT_LABELS[value]}</span>
        <ChevronDownIcon
          size={14}
          strokeWidth={1.5}
          className={cn(
            "text-muted-foreground transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </Menu.Trigger>
      <Menu.Portal container={portalContainer ?? undefined}>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-[60] outline-none"
        >
          <motion.div
            initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
            animate={
              open
                ? { opacity: 1, y: 0, scaleY: 1 }
                : { opacity: 0, y: -4, scaleY: 0.96 }
            }
            transition={open ? spring.fast : spring.fast.exit}
            style={{ transformOrigin: "top center" }}
            // Base UI defers unmount while actionsRef is set; release it once
            // the exit spring has finished so the close animation fully plays.
            onAnimationComplete={() => {
              if (!open) actionsRef.current?.unmount();
            }}
          >
            <FormatMenuContext.Provider value={menuCtx}>
              <Menu.Popup
                render={
                  <Elevated
                    offset={2}
                    shadowLevel={3}
                    ref={(node: HTMLDivElement | null) => {
                      (
                        containerRef as React.MutableRefObject<HTMLDivElement | null>
                      ).current = node;
                    }}
                  />
                }
                onMouseEnter={() => {
                  handlers.onMouseEnter();
                  setFocusedIndex(null);
                }}
                onMouseMove={handlers.onMouseMove}
                onMouseLeave={handlers.onMouseLeave}
                onFocus={(e) => {
                  const indexAttr = (e.target as HTMLElement)
                    .closest("[data-proximity-index]")
                    ?.getAttribute("data-proximity-index");
                  if (indexAttr != null) {
                    const idx = Number(indexAttr);
                    setActiveIndex(idx);
                    setFocusedIndex(
                      (e.target as HTMLElement).matches(":focus-visible")
                        ? idx
                        : null
                    );
                  }
                }}
                onBlur={(e) => {
                  if (containerRef.current?.contains(e.relatedTarget as Node))
                    return;
                  setFocusedIndex(null);
                  setActiveIndex(null);
                }}
                className={cn(
                  `relative flex flex-col gap-0.5 min-w-[var(--anchor-width)] ${menuShape.container} p-1 select-none outline-none`
                )}
              >
                {/* Selected background */}
                <AnimatePresence>
                  {checkedRect && (
                    <motion.div
                      className={`absolute ${menuShape.bg} bg-active pointer-events-none`}
                      initial={false}
                      animate={{
                        top: checkedRect.top,
                        left: checkedRect.left,
                        width: checkedRect.width,
                        height: checkedRect.height,
                        opacity: isHoveringOther ? 0.8 : 1,
                      }}
                      exit={{ opacity: 0, transition: spring.moderate.exit }}
                      transition={{
                        ...spring.moderate,
                        opacity: { duration: 0.08 },
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Hover background */}
                <AnimatePresence>
                  {activeRect && (
                    <motion.div
                      key={sessionRef.current}
                      className={`absolute ${menuShape.bg} bg-hover pointer-events-none`}
                      initial={{
                        opacity: 0,
                        top: checkedRect?.top ?? activeRect.top,
                        left: checkedRect?.left ?? activeRect.left,
                        width: checkedRect?.width ?? activeRect.width,
                        height: checkedRect?.height ?? activeRect.height,
                      }}
                      animate={{
                        opacity: 1,
                        top: activeRect.top,
                        left: activeRect.left,
                        width: activeRect.width,
                        height: activeRect.height,
                      }}
                      exit={{ opacity: 0, transition: spring.fast.exit }}
                      transition={{
                        ...spring.fast,
                        opacity: { duration: 0.08 },
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Focus ring */}
                <AnimatePresence>
                  {focusRect && (
                    <motion.div
                      className={`absolute ${menuShape.focusRing} pointer-events-none z-20 border border-[color:var(--focus-ring,#6B97FF)]`}
                      initial={false}
                      animate={{
                        left: focusRect.left - 2,
                        top: focusRect.top - 2,
                        width: focusRect.width + 4,
                        height: focusRect.height + 4,
                      }}
                      exit={{ opacity: 0, transition: spring.fast.exit }}
                      transition={{
                        ...spring.fast,
                        opacity: { duration: 0.08 },
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* display: contents keeps items direct flex children of the
                    popup so proximity measurement and gap layout still work,
                    while the group provides the radio value context. */}
                <Menu.RadioGroup
                  value={value}
                  onValueChange={(next) => onChange(next as ColorFormat)}
                  className="contents"
                >
                  {FORMATS.map((fmt, i) => (
                    <FormatItem
                      key={fmt}
                      index={i}
                      value={fmt}
                      label={FORMAT_LABELS[fmt]}
                      checked={value === fmt}
                    />
                  ))}
                </Menu.RadioGroup>
              </Menu.Popup>
            </FormatMenuContext.Provider>
          </motion.div>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

// ---------------------------------------------------------------------------
// ColorInput
//
// Two internal variants behind one API:
// - TextColorInput: draft-based text input (hex).
// - ScrubColorInput: numeric channels, built on Base UI's NumberField whose
//   ScrubArea provides pointer-lock scrubbing with a virtual cursor,
//   replacing the old hand-rolled pointer-capture logic.
// ---------------------------------------------------------------------------

interface ColorInputProps {
  value: string;
  onCommit: (next: string) => void;
  ariaLabel: string;
  width?: string;
  className?: string;
  inputClassName?: string;
  align?: "left" | "center" | "right";
  prefix?: ReactNode;
  inputMode?: "numeric" | "decimal" | "text";
  nudgeStep?: number;
  nudgeShiftStep?: number;
  hasPercent?: boolean;
  decimals?: number;
  scrubbable?: boolean;
  min?: number;
  max?: number;
  /** When true with min and max, wrap (modulo) instead of clamping. Used for angular values like hue. */
  wrap?: boolean;
}

const TextColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      value,
      onCommit,
      ariaLabel,
      width,
      className,
      inputClassName,
      align = "left",
      prefix,
      inputMode = "text",
      nudgeStep,
      nudgeShiftStep,
      hasPercent = false,
      decimals,
      min,
      max,
      wrap = false,
    },
    ref
  ) => {
    const [draft, setDraft] = useState(value);
    const interactingRef = useRef(false);
    const shape = useShape();

    useEffect(() => {
      if (!interactingRef.current) setDraft(value);
    }, [value]);

    const formatNumber = (n: number) =>
      decimals != null ? n.toFixed(decimals) : String(Math.round(n));

    const commitNumber = (n: number) => {
      let bounded = n;
      if (wrap && min != null && max != null) {
        const range = max - min;
        bounded = ((bounded - min) % range + range) % range + min;
      } else {
        if (min != null) bounded = Math.max(min, bounded);
        if (max != null) bounded = Math.min(max, bounded);
      }
      const formatted = formatNumber(bounded);
      const withSuffix = hasPercent ? `${formatted}%` : formatted;
      setDraft(withSuffix);
      onCommit(withSuffix);
    };

    const nudge = (direction: 1 | -1, shift: boolean) => {
      const baseStep = shift ? (nudgeShiftStep ?? 10) : (nudgeStep ?? 1);
      const cur = parseFloat(draft.replace("%", ""));
      if (Number.isNaN(cur)) return;
      commitNumber(cur + direction * baseStep);
    };

    return (
      <div
        className={cn(
          "flex items-center h-9 px-2 bg-transparent hover:bg-hover active:bg-active transition-colors duration-80 focus-within:ring-1 focus-within:ring-[color:var(--focus-ring,#6B97FF)] select-none",
          shape.input,
          className
        )}
        style={{ width }}
      >
        {prefix && (
          <span className="text-[12px] text-muted-foreground mr-1 select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={(e) => {
            interactingRef.current = true;
            e.currentTarget.select();
          }}
          onBlur={() => {
            interactingRef.current = false;
            if (draft !== value) {
              const numeric = parseFloat(draft.replace("%", ""));
              if (!Number.isNaN(numeric) && (min != null || max != null)) {
                commitNumber(numeric);
              } else {
                onCommit(draft);
              }
            } else setDraft(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.currentTarget as HTMLInputElement).blur();
            } else if (e.key === "Escape") {
              setDraft(value);
              (e.currentTarget as HTMLInputElement).blur();
            } else if (
              (nudgeStep != null || nudgeShiftStep != null) &&
              (e.key === "ArrowUp" || e.key === "ArrowDown")
            ) {
              e.preventDefault();
              nudge(e.key === "ArrowUp" ? 1 : -1, e.shiftKey);
            }
          }}
          inputMode={inputMode}
          aria-label={ariaLabel}
          className={cn(
            "flex-1 min-w-0 bg-transparent text-foreground text-[13px] outline-none tabular-nums",
            align === "center" && "text-center",
            align === "right" && "text-right",
            inputClassName
          )}
          style={{ fontVariationSettings: fontWeights.medium }}
        />
      </div>
    );
  }
);

TextColorInput.displayName = "TextColorInput";

const ScrubColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  (
    {
      value,
      onCommit,
      ariaLabel,
      width,
      className,
      inputClassName,
      align = "left",
      prefix,
      inputMode = "numeric",
      nudgeStep,
      nudgeShiftStep,
      hasPercent = false,
      decimals,
      min,
      max,
      wrap = false,
    },
    ref
  ) => {
    const shape = useShape();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [editing, setEditing] = useState(false);
    // Set on pointerdown inside the scrub area (capture phase, before Base UI
    // focuses the input for scrubbing) so onFocus can tell scrub-focus apart
    // from keyboard/programmatic focus.
    const pointerDownRef = useRef(false);

    const numeric = parseFloat(String(value).replace("%", ""));
    const fieldValue = Number.isNaN(numeric) ? null : numeric;

    const format = useMemo(() => {
      const f: Intl.NumberFormatOptions = { useGrouping: false };
      if (decimals != null) {
        f.minimumFractionDigits = decimals;
        f.maximumFractionDigits = decimals;
      } else {
        f.maximumFractionDigits = 0;
      }
      if (hasPercent) {
        // style "unit" + unit "percent" renders "50%" while keeping the
        // numeric value on the 0..100 scale (unlike style "percent").
        f.style = "unit";
        f.unit = "percent";
      }
      return f;
    }, [decimals, hasPercent]);

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      },
      [ref]
    );

    const commit = useCallback(
      (n: number) => {
        let bounded = n;
        if (wrap && min != null && max != null) {
          // Hue-style wrap: NumberField won't wrap natively, so shim it here
          // (361 → 1, -1 → 359; exactly `max` stays put).
          if (bounded < min || bounded > max) {
            const range = max - min;
            bounded = ((bounded - min) % range + range) % range + min;
          }
        } else {
          if (min != null) bounded = Math.max(min, bounded);
          if (max != null) bounded = Math.min(max, bounded);
        }
        const formatted =
          decimals != null ? bounded.toFixed(decimals) : String(Math.round(bounded));
        onCommit(hasPercent ? `${formatted}%` : formatted);
      },
      [wrap, min, max, decimals, hasPercent, onCommit]
    );

    return (
      <NumberField.Root
        dir="ltr"
        value={fieldValue}
        onValueChange={(next, eventDetails) => {
          if (next == null) return;
          const reason = eventDetails.reason;
          // Preserve the old commit-on-blur typing semantics: ignore the
          // per-keystroke parses and let the input-blur change land the final
          // value. Keyboard nudges, scrubbing, and wheel commit immediately.
          if (
            reason === "input-change" ||
            reason === "input-paste" ||
            reason === "input-clear"
          ) {
            return;
          }
          commit(next);
        }}
        onValueCommitted={(_, eventDetails) => {
          // After a scrub gesture ends, drop the focus Base UI placed on the
          // input so the field returns to its rest state (matching the old
          // behavior). For a no-drag press, ScrubArea dispatches a synthetic
          // click right after this, which re-enters edit mode below.
          if (eventDetails.reason === "scrub") {
            pointerDownRef.current = false;
            inputRef.current?.blur();
          }
        }}
        min={wrap ? undefined : min}
        max={wrap ? undefined : max}
        step={nudgeStep ?? 1}
        largeStep={nudgeShiftStep ?? 10}
        format={format}
        className={cn(
          "flex items-center h-9 bg-transparent hover:bg-hover active:bg-active transition-colors duration-80 focus-within:ring-1 focus-within:ring-[color:var(--focus-ring,#6B97FF)] select-none",
          shape.input,
          className
        )}
        style={{ width }}
      >
        <NumberField.ScrubArea
          direction="horizontal"
          pixelSensitivity={1}
          onPointerDownCapture={() => {
            pointerDownRef.current = true;
          }}
          onClick={() => {
            // Real clicks and the synthetic click ScrubArea dispatches after a
            // no-drag press both land here → enter edit mode (focus + select),
            // like the old click-to-edit behavior.
            pointerDownRef.current = false;
            setEditing(true);
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
          className={cn(
            "flex flex-1 min-w-0 items-center self-stretch px-2",
            !editing && "cursor-ew-resize"
          )}
        >
          <NumberField.ScrubAreaCursor className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
            <svg
              width={24}
              height={14}
              viewBox="0 0 24 14"
              fill="#000"
              stroke="#fff"
              strokeWidth={1}
              aria-hidden="true"
            >
              <path d="M0.5 7l5-5v3.5h13V2l5 5-5 5V8.5h-13V12l-5-5z" />
            </svg>
          </NumberField.ScrubAreaCursor>
          {prefix && (
            <span className="text-[12px] text-muted-foreground mr-1 select-none">
              {prefix}
            </span>
          )}
          <NumberField.Input
            ref={setInputRef}
            aria-label={ariaLabel}
            inputMode={inputMode}
            onPointerDown={(e) => {
              // While editing, let the input handle caret placement and text
              // selection itself instead of starting a scrub gesture.
              if (editing) e.stopPropagation();
            }}
            onFocus={(e) => {
              if (pointerDownRef.current) return; // scrub-initiated focus
              setEditing(true);
              e.currentTarget.select();
            }}
            onBlur={() => {
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              } else if (e.key === "Escape") {
                // Revert the draft like the old input: restore the committed
                // value's text before blurring so the input-blur commit is a
                // no-op.
                const input = e.currentTarget;
                const setter = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  "value"
                )?.set;
                if (setter && fieldValue != null) {
                  const restored =
                    decimals != null
                      ? fieldValue.toFixed(decimals)
                      : String(Math.round(fieldValue));
                  setter.call(input, hasPercent ? `${restored}%` : restored);
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                }
                input.blur();
              }
            }}
            className={cn(
              "flex-1 min-w-0 bg-transparent text-foreground text-[13px] outline-none tabular-nums",
              align === "center" && "text-center",
              align === "right" && "text-right",
              !editing && "pointer-events-none",
              inputClassName
            )}
            style={{ fontVariationSettings: fontWeights.medium }}
          />
        </NumberField.ScrubArea>
      </NumberField.Root>
    );
  }
);

ScrubColorInput.displayName = "ScrubColorInput";

const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ scrubbable = false, ...props }, ref) =>
    scrubbable ? (
      <ScrubColorInput ref={ref} {...props} />
    ) : (
      <TextColorInput ref={ref} {...props} />
    )
);

ColorInput.displayName = "ColorInput";

// ---------------------------------------------------------------------------
// EyeDropperButton
// ---------------------------------------------------------------------------

interface EyeDropperGlobal {
  open(): Promise<{ sRGBHex: string }>;
}

function EyeDropperButton({ onPick }: { onPick: (hex: string) => void }) {
  const [supported, setSupported] = useState(false);
  const shape = useShape();
  const PipetteIcon = useIcon("pipette");

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  if (!supported) return null;

  const handleClick = async () => {
    try {
      const Ctor = (window as unknown as { EyeDropper: new () => EyeDropperGlobal }).EyeDropper;
      const eye = new Ctor();
      const result = await eye.open();
      onPick(result.sRGBHex);
    } catch {
      // user cancelled
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Pick color from screen"
      className={cn(
        "flex items-center justify-center h-9 px-3 text-muted-foreground bg-transparent hover:bg-hover hover:text-foreground active:bg-active transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)] cursor-pointer",
        shape.input
      )}
    >
      <PipetteIcon size={16} strokeWidth={1.5} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// ColorTile (small colored square — checker behind alpha)
// ---------------------------------------------------------------------------

interface ColorTileProps {
  color: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

function ColorTile({ color, size = 24, className, style }: ColorTileProps) {
  const shape = useShape();
  return (
    <span
      className={cn("inline-block relative shrink-0 overflow-hidden", shape.bg, className)}
      style={{
        width: size,
        height: size,
        ...CHECKER_BG,
        boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.25)",
        ...style,
      }}
    >
      <span
        className="absolute inset-0"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// ColorSwatch (clickable strip swatch)
// ---------------------------------------------------------------------------

const ColorSwatch = forwardRef<HTMLButtonElement, ColorSwatchProps>(
  ({ color, size = 28, selected, className, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const shape = useShape();
    const [hovered, setHovered] = useState(false);
    const ring = selected
      ? "inset 0 0 0 1px rgba(127,127,127,0.25), 0 0 0 2px var(--background), 0 0 0 4px #6B97FF"
      : hovered
        ? "inset 0 0 0 1px rgba(127,127,127,0.25), 0 0 0 2px var(--background), 0 0 0 4px rgba(127,127,127,0.4)"
        : "inset 0 0 0 1px rgba(127,127,127,0.25)";
    return (
      <button
        ref={ref}
        type="button"
        aria-label={`Select color ${color}`}
        className={cn(
          "relative shrink-0 overflow-hidden cursor-pointer outline-none transition-shadow duration-100",
          shape.bg,
          className
        )}
        style={{
          width: size,
          height: size,
          ...CHECKER_BG,
          boxShadow: ring,
        }}
        onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
        onMouseLeave={(e) => { setHovered(false); onMouseLeave?.(e); }}
        {...props}
      >
        <span
          className="absolute inset-0"
          style={{ backgroundColor: color }}
        />
      </button>
    );
  }
);

ColorSwatch.displayName = "ColorSwatch";

// ---------------------------------------------------------------------------
// SwatchStrip
// ---------------------------------------------------------------------------

function SwatchStrip({
  swatches,
  current,
  onPick,
}: {
  swatches: string[];
  current: string;
  onPick: (color: string) => void;
}) {
  const normalizedCurrent = useMemo(() => {
    const p = parseColor(current);
    return p ? rgbToHexStr(p.r, p.g, p.b, p.a).toLowerCase() : "";
  }, [current]);

  // Named CSS colors ("red", "tomato") need the browser to normalize before
  // the selected-state comparison can match. Resolve them in an effect so
  // render (and SSR) never touch the DOM.
  const [resolvedSwatches, setResolvedSwatches] = useState<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const sw of swatches) {
      if (!parseColor(sw)) {
        const p = resolveCssColor(sw);
        if (p) next[sw] = rgbToHexStr(p.r, p.g, p.b, p.a).toLowerCase();
      }
    }
    setResolvedSwatches(next);
  }, [swatches]);

  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((sw, i) => {
        const parsed = parseColor(sw);
        const normalized = parsed
          ? rgbToHexStr(parsed.r, parsed.g, parsed.b, parsed.a).toLowerCase()
          : resolvedSwatches[sw] ?? sw.toLowerCase();
        const isSelected = normalized === normalizedCurrent;
        return (
          <ColorSwatch
            key={`${sw}-${i}`}
            color={sw}
            size={28}
            selected={isSelected}
            onClick={() => onPick(sw)}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ColorPicker (panel)
// ---------------------------------------------------------------------------

const ColorPickerImpl = forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      defaultValue = "#6B97FF",
      onValueChange,
      format,
      defaultFormat = "hex",
      onFormatChange,
      swatches,
      hideEyedropper,
      formatOpen,
      defaultFormatOpen,
      className,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(value ?? defaultValue);
    const currentRawValue = isControlled ? (value as string) : internalValue;

    const isFormatControlled = format !== undefined;
    const [internalFormat, setInternalFormat] = useState<ColorFormat>(defaultFormat);
    const currentFormat = isFormatControlled ? (format as ColorFormat) : internalFormat;

    // Internal HSV state (canonical). H is preserved across S=0 / V=0
    // transitions. Deliberately computed once from the initial value only.
    const initialParsed = useMemo(() => {
      const p = parseColor(currentRawValue);
      if (!p) return { h: 0, s: 1, v: 1, a: 1 };
      const hsv = rgbToHsv(p.r, p.g, p.b);
      return { h: hsv.s === 0 ? 0 : hsv.h, s: hsv.s, v: hsv.v, a: p.a };
    }, []);

    const [hsv, setHsv] = useState(initialParsed);

    // Sticky OKLCH hue: preserves the user's stated OKLCH H across the lossy
    // RGB round-trip (so the displayed H doesn't drift after release) and
    // across achromatic colors (where RGB-derived H would collapse to 0).
    // Cleared whenever the color changes through a non-OKLCH-internal channel.
    const oklchHueRef = useRef<number | null>(null);

    // External value sync — when controlled value changes from outside, sync HSV
    const lastEmittedRef = useRef<string>("");
    useEffect(() => {
      if (!isControlled) return;
      const emitted = lastEmittedRef.current;
      const cur = value as string;
      if (cur === emitted) return;
      const p = parseColor(cur);
      if (!p) return;
      oklchHueRef.current = null;
      const newHsv = rgbToHsv(p.r, p.g, p.b);
      setHsv((prev) => ({
        h: newHsv.s === 0 ? prev.h : newHsv.h,
        s: newHsv.s,
        v: newHsv.v,
        a: p.a,
      }));
    }, [value, isControlled]);

    const parsed = useMemo(
      () => buildParsed(hsv.h, hsv.s, hsv.v, hsv.a),
      [hsv]
    );

    const updateHsv = useCallback(
      (next: { h?: number; s?: number; v?: number; a?: number }) => {
        const merged = { ...hsv, ...next };
        setHsv(merged);
        const p = buildParsed(merged.h, merged.s, merged.v, merged.a);
        const formatted = formatValueByFormat(p, currentFormat);
        lastEmittedRef.current = formatted;
        if (!isControlled) setInternalValue(formatted);
        onValueChange?.(formatted, p);
      },
      [hsv, currentFormat, isControlled, onValueChange]
    );

    const handleFormatChange = useCallback(
      (f: ColorFormat) => {
        if (!isFormatControlled) setInternalFormat(f);
        onFormatChange?.(f);
        // Re-emit value in new format
        const formatted = formatValueByFormat(parsed, f);
        lastEmittedRef.current = formatted;
        if (!isControlled) setInternalValue(formatted);
        onValueChange?.(formatted, parsed);
      },
      [isFormatControlled, isControlled, onFormatChange, onValueChange, parsed]
    );

    const handleHexCommit = useCallback(
      (input: string) => {
        // resolveCssColor falls back to browser normalization so named CSS
        // colors ("red", "tomato") from swatches or the hex field work too.
        // Safe here: this only ever runs inside event handlers.
        const p = resolveCssColor(input);
        if (!p) return;
        oklchHueRef.current = null;
        const newHsv = rgbToHsv(p.r, p.g, p.b);
        const merged = {
          h: newHsv.s === 0 ? hsv.h : newHsv.h,
          s: newHsv.s,
          v: newHsv.v,
          a: p.a,
        };
        setHsv(merged);
        const next = buildParsed(merged.h, merged.s, merged.v, merged.a);
        const formatted = formatValueByFormat(next, currentFormat);
        lastEmittedRef.current = formatted;
        if (!isControlled) setInternalValue(formatted);
        onValueChange?.(formatted, next);
      },
      [hsv.h, currentFormat, isControlled, onValueChange]
    );

    const handleSwatchPick = useCallback(
      (sw: string) => {
        handleHexCommit(sw);
      },
      [handleHexCommit]
    );

    const handleEyedrop = useCallback(
      (hex: string) => {
        handleHexCommit(hex);
      },
      [handleHexCommit]
    );

    const solidHueRgb = useMemo(() => hsvToRgb(hsv.h, hsv.s, hsv.v), [hsv.h, hsv.s, hsv.v]);
    const solidR = Math.round(solidHueRgb.r);
    const solidG = Math.round(solidHueRgb.g);
    const solidB = Math.round(solidHueRgb.b);
    const solidColorString = `rgb(${solidR}, ${solidG}, ${solidB})`;
    const shape = useShape();
    const substrate = useSurface();
    // The picker panel uses bg-card (surface-3) by default; when wrapped in
    // ColorPickerPopover the className override pushes it higher. Either way,
    // announce the panel's effective level so descendants (FormatDropdown,
    // etc.) elevate above it instead of colliding at the same surface.
    const pickerLevel = Math.max(substrate, 3);

    return (
      <SurfaceProvider value={pickerLevel}>
      <div
        ref={ref}
        className={cn("flex flex-col gap-2 p-3", surfaceClasses(pickerLevel, 1), shape.container, className)}
        style={{ width: PANEL_WIDTH }}
        {...props}
      >
        <SaturationSquare
          h={hsv.h}
          s={hsv.s}
          v={hsv.v}
          onChange={(s, v) => updateHsv({ s, v })}
        />

        <div className="flex flex-col [&>*]:mb-0 [&>*+*]:-mt-px">
          <HueSlider h={hsv.h} onChange={(h) => { oklchHueRef.current = null; updateHsv({ h }); }} />
          <AlphaSlider
            a={hsv.a}
            solidColor={solidColorString}
            solidR={solidR}
            solidG={solidG}
            solidB={solidB}
            onChange={(a) => updateHsv({ a })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormatDropdown
            value={currentFormat}
            onChange={handleFormatChange}
            open={formatOpen}
            defaultOpen={defaultFormatOpen}
          />
          {!hideEyedropper && <EyeDropperButton onPick={handleEyedrop} />}
        </div>

        <ColorInputsRow
          parsed={parsed}
          format={currentFormat}
          oklchHue={oklchHueRef.current}
          onChannelChange={(channel, value) => {
            const p = { ...parsed };
            switch (channel) {
              case "hex": handleHexCommit(value as string); return;
              case "r": case "g": case "b": {
                oklchHueRef.current = null;
                const r = channel === "r" ? Number(value) : p.r;
                const g = channel === "g" ? Number(value) : p.g;
                const b = channel === "b" ? Number(value) : p.b;
                const hsvVal = rgbToHsv(r, g, b);
                updateHsv({
                  h: hsvVal.s === 0 ? hsv.h : hsvVal.h,
                  s: hsvVal.s,
                  v: hsvVal.v,
                });
                return;
              }
              case "hSL": case "sSL": case "lSL": {
                if (channel === "hSL") oklchHueRef.current = null;
                const hsl = rgbToHsl(p.r, p.g, p.b);
                const h2 = channel === "hSL" ? Number(value) : hsl.h;
                const s2 = channel === "sSL" ? Number(value) / 100 : hsl.s;
                const l2 = channel === "lSL" ? Number(value) / 100 : hsl.l;
                const rgb = hslToRgb(h2, clamp01(s2), clamp01(l2));
                const hsvVal = rgbToHsv(rgb.r, rgb.g, rgb.b);
                updateHsv({
                  h: hsvVal.s === 0 ? h2 : hsvVal.h,
                  s: hsvVal.s,
                  v: hsvVal.v,
                });
                return;
              }
              case "L": case "C": case "H": {
                const cur = rgbToOklch(p.r, p.g, p.b);
                // For L/C edits, anchor on the user's last stated H so we
                // don't drift along with chroma changes.
                const baseH = oklchHueRef.current ?? cur.H;
                const L = channel === "L" ? Number(value) / 100 : cur.L;
                const C = channel === "C" ? Number(value) : cur.C;
                const H = channel === "H" ? Number(value) : baseH;
                oklchHueRef.current = H;
                const rgb = oklchToRgb(clamp01(L), Math.max(0, C), H);
                const hsvVal = rgbToHsv(rgb.r, rgb.g, rgb.b);
                updateHsv({
                  h: hsvVal.s === 0 ? hsv.h : hsvVal.h,
                  s: hsvVal.s,
                  v: hsvVal.v,
                });
                return;
              }
              case "alphaPercent": {
                const a = clamp01(Number(value) / 100);
                updateHsv({ a });
                return;
              }
            }
          }}
        />

        {swatches && swatches.length > 0 && (
          <SwatchStrip
            swatches={swatches}
            current={parsed.hex}
            onPick={handleSwatchPick}
          />
        )}
      </div>
      </SurfaceProvider>
    );
  }
);

ColorPickerImpl.displayName = "ColorPicker";

const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(props, ref) {
    return (
      <MotionConfig reducedMotion="user">
        <ColorPickerImpl ref={ref} {...props} />
      </MotionConfig>
    );
  }
);

ColorPicker.displayName = "ColorPicker";

// ---------------------------------------------------------------------------
// ColorInputsRow — adapts inputs to format
// ---------------------------------------------------------------------------

type ChannelKey =
  | "hex"
  | "r" | "g" | "b"
  | "hSL" | "sSL" | "lSL"
  | "L" | "C" | "H"
  | "alphaPercent";

function ColorInputsRow({
  parsed,
  format,
  oklchHue,
  onChannelChange,
}: {
  parsed: ParsedColor;
  format: ColorFormat;
  /** Sticky OKLCH hue override for display (preserves user's stated H across round-trip drift). */
  oklchHue?: number | null;
  onChannelChange: (key: ChannelKey, value: string) => void;
}) {
  const alphaPct = Math.round(parsed.a * 100);

  if (format === "hex") {
    const hexNoHash = parsed.hex.replace(/^#/, "").toUpperCase();
    return (
      <div dir="ltr" className="grid grid-cols-2 gap-2">
        <ChannelTooltip label="Hex">
          <ColorInput
            value={hexNoHash}
            onCommit={(next) => onChannelChange("hex", next.startsWith("#") ? next : `#${next}`)}
            ariaLabel="Hex value"
            prefix="#"
          />
        </ChannelTooltip>
        <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
      </div>
    );
  }

  if (format === "rgb") {
    return (
      <div dir="ltr" className="grid grid-cols-4 gap-1">
        <ChannelTooltip label="Red"><ColorInput value={String(parsed.r)} onCommit={(n) => onChannelChange("r", n)} ariaLabel="Red" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={255} /></ChannelTooltip>
        <ChannelTooltip label="Green"><ColorInput value={String(parsed.g)} onCommit={(n) => onChannelChange("g", n)} ariaLabel="Green" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={255} /></ChannelTooltip>
        <ChannelTooltip label="Blue"><ColorInput value={String(parsed.b)} onCommit={(n) => onChannelChange("b", n)} ariaLabel="Blue" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={255} /></ChannelTooltip>
        <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
      </div>
    );
  }

  if (format === "hsl") {
    const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
    return (
      <div dir="ltr" className="grid grid-cols-4 gap-1">
        <ChannelTooltip label="Hue"><ColorInput value={String(Math.round(hsl.h))} onCommit={(n) => onChannelChange("hSL", n)} ariaLabel="Hue" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={360} wrap /></ChannelTooltip>
        <ChannelTooltip label="Saturation"><ColorInput value={String(Math.round(hsl.s * 100))} onCommit={(n) => onChannelChange("sSL", n)} ariaLabel="Saturation" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={100} /></ChannelTooltip>
        <ChannelTooltip label="Lightness"><ColorInput value={String(Math.round(hsl.l * 100))} onCommit={(n) => onChannelChange("lSL", n)} ariaLabel="Lightness" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={100} /></ChannelTooltip>
        <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
      </div>
    );
  }

  // oklch
  const oklch = rgbToOklch(parsed.r, parsed.g, parsed.b);
  const displayH = oklchHue ?? oklch.H;
  return (
    <div dir="ltr" className="grid grid-cols-4 gap-1">
      <ChannelTooltip label="Lightness"><ColorInput value={(oklch.L * 100).toFixed(0)} onCommit={(n) => onChannelChange("L", n)} ariaLabel="Lightness" align="center" inputMode="decimal" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={100} /></ChannelTooltip>
      <ChannelTooltip label="Chroma"><ColorInput value={oklch.C.toFixed(2)} onCommit={(n) => onChannelChange("C", n)} ariaLabel="Chroma" align="center" inputMode="decimal" nudgeStep={0.01} nudgeShiftStep={0.1} decimals={2} scrubbable min={0} max={0.4} /></ChannelTooltip>
      <ChannelTooltip label="Hue"><ColorInput value={displayH.toFixed(0)} onCommit={(n) => onChannelChange("H", n)} ariaLabel="Hue" align="center" inputMode="numeric" nudgeStep={1} nudgeShiftStep={10} scrubbable min={0} max={360} wrap /></ChannelTooltip>
      <AlphaInput value={alphaPct} onCommit={(n) => onChannelChange("alphaPercent", String(n))} />
    </div>
  );
}

function ChannelTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip content={label} delayDuration={300}>
      <div>{children}</div>
    </Tooltip>
  );
}

function AlphaInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  return (
    <ChannelTooltip label="Alpha">
      <ColorInput
        value={`${value}%`}
        onCommit={(input) => {
          const n = parseFloat(input.replace("%", ""));
          if (Number.isNaN(n)) return;
          onCommit(Math.max(0, Math.min(100, Math.round(n))));
        }}
        ariaLabel="Alpha"
        align="center"
        inputMode="numeric"
        nudgeStep={1}
        nudgeShiftStep={10}
        hasPercent
        scrubbable
        min={0}
        max={100}
      />
    </ChannelTooltip>
  );
}

// ---------------------------------------------------------------------------
// ColorPickerPopover (trigger button + popover panel)
//
// Built on Base UI's Popover primitive, which owns positioning (anchor
// tracking + collision flipping — the old version placed the panel at a
// captured rect and could overflow the viewport bottom), dismissal (outside
// press, focus-out, Escape only while focus is relevant), and focus
// management (focus moves into the panel on open and restores to the trigger
// on close). The spring open/close animation stays via the actionsRef
// deferred-unmount pattern (same as select.tsx) — the previous conditional
// portal unmounted the AnimatePresence container itself, so the exit
// animation never played.
// ---------------------------------------------------------------------------

const ColorPickerPopoverImpl = forwardRef<HTMLDivElement, ColorPickerPopoverProps>(
  (
    {
      triggerLabel,
      triggerLabelPosition = "left",
      triggerShowValue = true,
      triggerShowRemove = false,
      onTriggerRemove,
      triggerClassName,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      ...pickerProps
    },
    ref
  ) => {
    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const open = isOpenControlled ? openProp : internalOpen;
    const actionsRef = useRef<{ unmount: () => void; close: () => void } | null>(null);
    const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
    const shape = useShape();
    const substrate = useSurface();
    const level = Math.min(substrate + 2, 8);

    const handleOpenChange = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isOpenControlled, onOpenChange]
    );

    const isControlled = pickerProps.value !== undefined;
    const [internalValue, setInternalValue] = useState(pickerProps.value ?? pickerProps.defaultValue ?? "#6B97FF");
    const currentValue = isControlled ? (pickerProps.value as string) : internalValue;

    const handleValueChange = useCallback(
      (v: string, parsed: ParsedColor) => {
        if (!isControlled) setInternalValue(v);
        pickerProps.onValueChange?.(v, parsed);
      },
      [isControlled, pickerProps]
    );

    // Release Base UI's deferred unmount once the exit tween has played.
    // onAnimationComplete on the motion.div is the primary signal; this
    // timeout is a fallback for throttled/background tabs where rAF-driven
    // animation callbacks can stall (spring.moderate.exit is 120ms — 150ms
    // covers it with margin).
    useEffect(() => {
      if (open) return;
      const id = setTimeout(() => actionsRef.current?.unmount(), 150);
      return () => clearTimeout(id);
    }, [open]);

    const XIcon = useIcon("x");
    const parsed = useMemo(() => parseColor(currentValue), [currentValue]);
    const swatchColor = parsed
      ? rgbToHexStr(parsed.r, parsed.g, parsed.b, parsed.a)
      : currentValue;
    const valueLabel = parsed
      ? rgbToHexStr(parsed.r, parsed.g, parsed.b, 1).replace(/^#/, "").toUpperCase()
      : currentValue;

    return (
      <Popover.Root
        open={open}
        onOpenChange={handleOpenChange}
        actionsRef={actionsRef}
        // Non-modal: the page keeps scrolling and the Positioner tracks the
        // anchor, so the panel follows its trigger instead of detaching.
        modal={false}
      >
        <div ref={ref} className="inline-flex">
          <Popover.Trigger
            className={cn(
              "flex items-center gap-2 h-9 px-2 border border-border bg-transparent hover:bg-hover transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)] cursor-pointer",
              shape.input,
              triggerShowRemove && "rounded-e-none",
              triggerClassName
            )}
            style={{ fontVariationSettings: fontWeights.medium }}
          >
            {triggerLabel && triggerLabelPosition === "left" && (
              <span className="text-[13px] text-muted-foreground px-1 select-none">
                {triggerLabel}
              </span>
            )}
            <ColorTile color={swatchColor} size={20} />
            {triggerShowValue && (
              <span dir="ltr" className="text-[13px] text-foreground tabular-nums">
                {valueLabel}
              </span>
            )}
            {triggerLabel && triggerLabelPosition === "right" && (
              <span className="text-[13px] text-muted-foreground px-1 select-none">
                {triggerLabel}
              </span>
            )}
          </Popover.Trigger>
          {triggerShowRemove && (
            <button
              type="button"
              aria-label="Remove color"
              onClick={onTriggerRemove}
              className={cn(
                "-ms-px flex h-9 items-center border border-border bg-transparent px-2 text-muted-foreground outline-none transition-colors duration-80 hover:bg-hover hover:text-foreground focus-visible:ring-1 focus-visible:ring-[color:var(--focus-ring,#6B97FF)]",
                shape.input,
                "rounded-s-none"
              )}
            >
              <XIcon size={14} strokeWidth={1.5} />
            </button>
          )}
          <Popover.Portal>
            <Popover.Positioner
              side="bottom"
              align="start"
              sideOffset={6}
              className="z-50 outline-none"
            >
              <motion.div
                initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
                animate={
                  open
                    ? { opacity: 1, y: 0, scaleY: 1 }
                    : { opacity: 0, y: -4, scaleY: 0.96 }
                }
                transition={open ? spring.moderate : spring.moderate.exit}
                style={{ transformOrigin: "top" }}
                // Base UI defers unmount while actionsRef is set; release it
                // once the exit spring has finished so the close animation
                // fully plays.
                onAnimationComplete={() => {
                  if (!open) actionsRef.current?.unmount();
                }}
              >
                <Popover.Popup
                  render={<div ref={setPanelEl} />}
                  className="outline-none"
                >
                  <ColorPickerPortalContainer value={panelEl}>
                    <SurfaceProvider value={level}>
                      <ColorPicker
                        {...pickerProps}
                        value={currentValue}
                        onValueChange={handleValueChange}
                        className={cn(
                          surfaceClasses(level, 3),
                          pickerProps.className
                        )}
                      />
                    </SurfaceProvider>
                  </ColorPickerPortalContainer>
                </Popover.Popup>
              </motion.div>
            </Popover.Positioner>
          </Popover.Portal>
        </div>
      </Popover.Root>
    );
  }
);

ColorPickerPopoverImpl.displayName = "ColorPickerPopover";

const ColorPickerPopover = forwardRef<HTMLDivElement, ColorPickerPopoverProps>(
  function ColorPickerPopover(props, ref) {
    return (
      <MotionConfig reducedMotion="user">
        <ColorPickerPopoverImpl ref={ref} {...props} />
      </MotionConfig>
    );
  }
);

ColorPickerPopover.displayName = "ColorPickerPopover";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  ColorPicker,
  ColorPickerPopover,
  ColorPickerPortalContainer,
  ColorSwatch,
  ColorTile,
  parseColor,
  buildParsed,
};

export type {
  ColorPickerProps,
  ColorPickerPopoverProps,
  ColorSwatchProps,
  ColorFormat,
  ParsedColor,
};
