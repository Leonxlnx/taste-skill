"use client";

import type { SVGProps } from "react";

import styles from "./magic-wand-motion.module.css";

export interface MagicWandMotionProps extends Omit<SVGProps<SVGSVGElement>, "title"> {
  isAnimated?: boolean;
  size?: number;
  title?: string | null;
}

export function MagicWandMotion({
  className,
  isAnimated = false,
  size = 32,
  title = "Magic wand",
  ...props
}: MagicWandMotionProps) {
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
        className={styles.Wand}
        d="M29.4141,24,12,6.5859a2.0476,2.0476,0,0,0-2.8281,0l-2.586,2.586a2.0021,2.0021,0,0,0,0,2.8281L23.999,29.4141a2.0024,2.0024,0,0,0,2.8281,0l2.587-2.5865a1.9993,1.9993,0,0,0,0-2.8281ZM8,10.5859,10.5859,8l5,5-2.5866,2.5869-5-5ZM25.4131,28l-11-10.999L17,14.4141l11,11Z"
      />
      <g className={styles.SparkleLeftContainer}>
        <path className={styles.SparkleLeft} d="M2.586 14.586H5.414V17.414H2.586z" />
      </g>
      <path className={styles.SparkleCenter} d="M2.586 2.586H5.414V5.414H2.586z" />
      <g className={styles.SparkleRightContainer}>
        <path className={styles.SparkleRight} d="M14.586 2.586H17.414V5.414H14.586z" />
      </g>
    </svg>
  );
}
