"use client";

import type { SVGProps } from "react";

import styles from "./search-locate-motion.module.css";

export interface SearchLocateMotionProps extends Omit<SVGProps<SVGSVGElement>, "title"> {
  isAnimated?: boolean;
  size?: number;
  title?: string | null;
}

export function SearchLocateMotion({
  className,
  isAnimated = false,
  size = 32,
  title = "Search locate",
  ...props
}: SearchLocateMotionProps) {
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
        className={styles.SearchLocate}
        d="M30,27.6l-4.7-4.7c2.7-3.5,2.1-8.5-1.4-11.3S15.4,9.5,12.6,13s-2.1,8.5,1.4,11.3c2.9,2.3,7,2.3,9.9,0l4.7,4.7L30,27.6z M19,24c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6C25,21.3,22.3,24,19,24z"
      />
      <path d="M2,1h16v2H2V1z" />
      <path className={styles.SearchLocateLine2} d="M2,6h16v2H2V6z" />
      <path d="M2,11h8v2H2V11z" />
    </svg>
  );
}
