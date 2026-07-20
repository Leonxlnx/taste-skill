import * as React from "react";

import { cn } from "./utils";

import "./projected-shadow-animation.css";

type ProjectedShadowTimingValue = number | string;
type CssVariableStyle = React.CSSProperties & Record<`--${string}`, string>;

export type ProjectedShadowProps = React.ComponentPropsWithoutRef<"span"> & {
  /** Keep the gathered state active without requiring hover. */
  active?: boolean;
  /** Animation duration for release. Numeric values are converted to ms. */
  duration?: ProjectedShadowTimingValue;
  /** Animation duration for gather. Numeric values are converted to ms. */
  activeDuration?: ProjectedShadowTimingValue;
  /** CSS easing used by the transform and opacity transitions. */
  ease?: string;
  /** Optional decorative content for the shadow layers. Defaults to children. */
  shadow?: React.ReactNode;
  /** Classes applied to the visible animated child wrapper. */
  targetClassName?: string;
  /** Classes applied to the far projected shadow layer. */
  projectedShadowClassName?: string;
  /** Classes applied to the close contact shadow layer. */
  contactShadowClassName?: string;
  /** Hide the far projected shadow layer. */
  showProjectedShadow?: boolean;
  /** Hide the close contact shadow layer. */
  showContactShadow?: boolean;
};

export function ProjectedShadow({
  active,
  activeDuration,
  children,
  className,
  contactShadowClassName,
  duration,
  ease,
  projectedShadowClassName,
  shadow,
  showContactShadow = true,
  showProjectedShadow = true,
  style,
  targetClassName,
  ...props
}: ProjectedShadowProps) {
  const shadowContent = shadow ?? children;

  return (
    <span
      data-slot="projected-shadow"
      data-active={active ? "true" : undefined}
      className={cn(
        "projected-shadow relative inline-flex items-center justify-center",
        className,
      )}
      style={getProjectedShadowStyle({ activeDuration, duration, ease }, style)}
      {...props}
    >
      {showProjectedShadow ? (
        <span
          aria-hidden="true"
          data-slot="projected-shadow-projected"
          className={cn(
            "projected-shadow-layer projected-shadow-projected pointer-events-none absolute inset-0 z-0 inline-flex text-current blur-[6px]",
            projectedShadowClassName,
          )}
        >
          {shadowContent}
        </span>
      ) : null}

      {showContactShadow ? (
        <span
          aria-hidden="true"
          data-slot="projected-shadow-contact"
          className={cn(
            "projected-shadow-layer projected-shadow-contact pointer-events-none absolute inset-0 z-0 inline-flex text-current",
            contactShadowClassName,
          )}
        >
          {shadowContent}
        </span>
      ) : null}

      <span
        data-slot="projected-shadow-target"
        className={cn(
          "projected-shadow-layer projected-shadow-target relative z-10 inline-flex text-current",
          targetClassName,
        )}
      >
        {children}
      </span>
    </span>
  );
}

function getProjectedShadowStyle(
  {
    activeDuration,
    duration,
    ease,
  }: Pick<ProjectedShadowProps, "activeDuration" | "duration" | "ease">,
  style: React.CSSProperties | undefined,
) {
  if (activeDuration === undefined && duration === undefined && ease === undefined) {
    return style;
  }

  return {
    ...style,
    ...(activeDuration !== undefined
      ? { "--projected-shadow-active-duration": toCssTime(activeDuration) }
      : {}),
    ...(duration !== undefined
      ? { "--projected-shadow-duration": toCssTime(duration) }
      : {}),
    ...(ease !== undefined ? { "--projected-shadow-ease": ease } : {}),
  } as CssVariableStyle;
}

function toCssTime(value: ProjectedShadowTimingValue) {
  return typeof value === "number" ? `${value}ms` : value;
}
