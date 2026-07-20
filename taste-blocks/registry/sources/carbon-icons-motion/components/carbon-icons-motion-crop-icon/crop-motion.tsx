"use client";

import type { SVGProps } from "react";

import styles from "./crop-motion.module.css";

export interface CropMotionProps extends Omit<SVGProps<SVGSVGElement>, "title"> {
  isAnimated?: boolean;
  size?: number;
  title?: string | null;
}

export function CropMotion({
  className,
  isAnimated = false,
  size = 32,
  title = "Crop",
  ...props
}: CropMotionProps) {
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
      <path className={styles.CropTop} d="M25,20H23V9H12V7H23a2,2,0,0,1,2,2Z" />
      <path className={styles.CropBottom} d="M9,23V2H7V7H2V9H7V23a2,2,0,0,0,2,2H23v5h2V25h5V23Z" />
      <rect fill="none" height="32" width="32" />
    </svg>
  );
}
