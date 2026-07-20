"use client";

import type { SVGProps } from "react";

import styles from "./center-circle-motion.module.css";

export interface CenterCircleMotionProps extends Omit<SVGProps<SVGSVGElement>, "title"> {
  isAnimated?: boolean;
  size?: number;
  title?: string | null;
}

export function CenterCircleMotion({
  className,
  isAnimated = false,
  size = 32,
  title = "Center circle",
  ...props
}: CenterCircleMotionProps) {
  const hasAccessibleName = Boolean(title || props["aria-label"] || props["aria-labelledby"]);

  return (
    <svg
      fill="currentColor"
      {...props}
      aria-hidden={hasAccessibleName ? props["aria-hidden"] : true}
      className={[isAnimated ? styles.isAnimating : "", className].filter(Boolean).join(" ")}
      height={size}
      role={props.role ?? (hasAccessibleName ? "img" : undefined)}
      viewBox="0 0 32 32"
      width={size}
    >
      {title ? <title>{title}</title> : null}
      <path
        className={styles.CenterCircle}
        d="M27,16c0,6.1-4.9,11-11,11S5,22.1,5,16S9.9,5,16,5S27,9.9,27,16z"
        fill="none"
        stroke="currentColor"
      />
      <path className={styles.CenterCircleTop} d="M17,2h-2v8h2V2z" />
      <path className={styles.CenterCircleRight} d="M10.1,17v-2h-8v2H10.1z" />
      <path className={styles.CenterCircleBottom} d="M15,29.9h2v-8h-2V29.9z" />
      <path className={styles.CenterCircleLeft} d="M29.9,17v-2h-8v2H29.9z" />
      <path d="M29.9,17v-2h-8v2H29.9z M15,29.9h2v-8h-2V29.9z M10.1,17v-2h-8v2H10.1z M17,2h-2v8h2V2z" />
    </svg>
  );
}
