// Tremor ProgressCircle [v0.0.3]
// Modified by Taste Blocks on 2026-07-20: normalized progress values, forwarded accessible labeling, and disabled motion when reduced motion is requested.

import React from "react"
import { tv, VariantProps } from "tailwind-variants"

import { cx } from "../../utils/cx"

const progressCircleVariants = tv({
  slots: {
    background: "",
    circle: "",
  },
  variants: {
    variant: {
      default: {
        background: "stroke-blue-200 dark:stroke-blue-500/30",
        circle: "stroke-blue-500 dark:stroke-blue-500",
      },
      neutral: {
        background: "stroke-gray-200 dark:stroke-gray-500/40",
        circle: "stroke-gray-500 dark:stroke-gray-500",
      },
      warning: {
        background: "stroke-yellow-200 dark:stroke-yellow-500/30",
        circle: "stroke-yellow-500 dark:stroke-yellow-500",
      },
      error: {
        background: "stroke-red-200 dark:stroke-red-500/30",
        circle: "stroke-red-500 dark:stroke-red-500",
      },
      success: {
        background: "stroke-emerald-200 dark:stroke-emerald-500/30",
        circle: "stroke-emerald-500 dark:stroke-emerald-500",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

interface ProgressCircleProps
  extends Omit<React.SVGProps<SVGSVGElement>, "value">,
    VariantProps<typeof progressCircleVariants> {
  value?: number
  max?: number
  showAnimation?: boolean
  radius?: number
  strokeWidth?: number
  children?: React.ReactNode
}

const ProgressCircle = React.forwardRef<SVGSVGElement, ProgressCircleProps>(
  (
    {
      value = 0,
      max = 100,
      radius = 32,
      strokeWidth = 6,
      showAnimation = true,
      variant,
      className,
      children,
      "aria-describedby": ariaDescribedBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-valuetext": ariaValueText,
      ...props
    }: ProgressCircleProps,
    forwardedRef,
  ) => {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100
    const safeValue = Math.min(
      safeMax,
      Math.max(Number.isFinite(value) ? value : 0, 0),
    )
    const normalizedRadius = radius - strokeWidth / 2
    const circumference = normalizedRadius * 2 * Math.PI
    const offset = circumference - (safeValue / safeMax) * circumference

    const { background, circle } = progressCircleVariants({ variant })
    return (
      <div
        className={cx("relative")}
        role="progressbar"
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : "Progress")}
        aria-labelledby={ariaLabelledBy}
        aria-valuenow={safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuetext={ariaValueText}
        data-max={safeMax}
        data-value={safeValue}
        tremor-id="tremor-raw"
      >
        <svg
          ref={forwardedRef}
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className={cx("-rotate-90 transform", className)}
          {...props}
          aria-hidden="true"
        >
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            stroke=""
            strokeLinecap="round"
            className={cx("transition-colors ease-linear", background())}
          />
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            fill="transparent"
            stroke=""
            strokeLinecap="round"
            className={cx(
              "transition-colors ease-linear motion-reduce:transition-none",
              circle(),
              showAnimation &&
                "transform-gpu transition-all duration-300 ease-in-out motion-reduce:transition-none",
            )}
          />
        </svg>
        <div
          className={cx("absolute inset-0 flex items-center justify-center")}
          aria-hidden="true"
        >
          {children}
        </div>
      </div>
    )
  },
)

ProgressCircle.displayName = "ProgressCircle"

export { ProgressCircle, type ProgressCircleProps }
