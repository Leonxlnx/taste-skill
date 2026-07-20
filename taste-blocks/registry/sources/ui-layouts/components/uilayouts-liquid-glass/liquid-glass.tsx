"use client";

import { motion, type Variants, useReducedMotion } from "motion/react";
import type React from "react";
import { useId, useState } from "react";

import { cn } from "../../lib/utils";

type LiquidGlassCardProps = Omit<
  React.ComponentProps<typeof motion.div>,
  "children" | "drag" | "draggable" | "height" | "onClick" | "width"
> & {
  children: React.ReactNode;
  draggable?: boolean;
  expandable?: boolean;
  width?: string;
  height?: string;
  expandedWidth?: string;
  expandedHeight?: string;
  blurIntensity?: "sm" | "md" | "lg" | "xl";
  shadowIntensity?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  borderRadius?: string;
  glowIntensity?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
};

export const LiquidGlassCard = ({
  children,
  className = "",
  draggable = false,
  expandable = false,
  width,
  height,
  expandedWidth,
  expandedHeight,
  blurIntensity = "xl",
  borderRadius = "32px",
  glowIntensity = "sm",
  shadowIntensity = "md",
  style,
  ...props
}: LiquidGlassCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const filterId = `liquid-glass-${useId().replaceAll(":", "")}`;

  const blurClasses = {
    sm: "backdrop-blur-xs",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const shadowStyles = {
    none: "inset 0 0 0 0 rgba(255, 255, 255, 0)",
    xs: "inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.3)",
    sm: "inset 2px 2px 2px 0 rgba(255, 255, 255, 0.35), inset -2px -2px 2px 0 rgba(255, 255, 255, 0.35)",
    md: "inset 3px 3px 3px 0 rgba(255, 255, 255, 0.45), inset -3px -3px 3px 0 rgba(255, 255, 255, 0.45)",
    lg: "inset 4px 4px 4px 0 rgba(255, 255, 255, 0.5), inset -4px -4px 4px 0 rgba(255, 255, 255, 0.5)",
    xl: "inset 6px 6px 6px 0 rgba(255, 255, 255, 0.55), inset -6px -6px 6px 0 rgba(255, 255, 255, 0.55)",
  };

  const glowStyles = {
    none: "0 4px 4px rgba(0, 0, 0, 0.05), 0 0 12px rgba(0, 0, 0, 0.05)",
    xs: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 16px rgba(255, 255, 255, 0.05)",
    sm: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 24px rgba(255, 255, 255, 0.1)",
    md: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 32px rgba(255, 255, 255, 0.15)",
    lg: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 40px rgba(255, 255, 255, 0.2)",
    xl: "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 48px rgba(255, 255, 255, 0.25)",
  };

  const containerVariants: Variants = expandable
    ? {
        collapsed: {
          width: width || "auto",
          height: height || "auto",
          transition: {
            duration: shouldReduceMotion ? 0 : 0.4,
            ease: [0.5, 1.5, 0.5, 1],
          },
        },
        expanded: {
          width: expandedWidth || "auto",
          height: expandedHeight || "auto",
          transition: {
            duration: shouldReduceMotion ? 0 : 0.4,
            ease: [0.5, 1.5, 0.5, 1],
          },
        },
      }
    : {};

  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id={filterId} filterUnits="objectBoundingBox" height="100%" width="100%" x="0" y="0">
            <feTurbulence
              baseFrequency="0.003 0.007"
              numOctaves="1"
              result="turbulence"
              type="fractalNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="200"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <motion.div
        {...props}
        animate={expandable ? (isExpanded ? "expanded" : "collapsed") : undefined}
        className={cn(
          "relative",
          draggable && !shouldReduceMotion && "cursor-grab active:cursor-grabbing",
          className,
        )}
        drag={!shouldReduceMotion && draggable}
        dragConstraints={draggable ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined}
        dragElastic={draggable ? 0.3 : undefined}
        dragTransition={
          draggable ? { bounceStiffness: 300, bounceDamping: 10, power: 0.3 } : undefined
        }
        style={{
          ...style,
          borderRadius,
          ...(width && !expandable && { width }),
          ...(height && !expandable && { height }),
        }}
        variants={containerVariants}
        whileDrag={!shouldReduceMotion && draggable ? { scale: 1.02 } : undefined}
        whileHover={!shouldReduceMotion && draggable ? { scale: 1.01 } : undefined}
        whileTap={!shouldReduceMotion && draggable ? { scale: 0.98 } : undefined}
      >
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 z-0", blurClasses[blurIntensity])}
          style={{ borderRadius, filter: `url(#${filterId})` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10"
          style={{ borderRadius, boxShadow: glowStyles[glowIntensity] }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20"
          style={{ borderRadius, boxShadow: shadowStyles[shadowIntensity] }}
        />
        {children}
        {expandable && (
          <button
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse glass card" : "Expand glass card"}
            className="absolute right-3 top-3 z-30 grid size-8 place-items-center rounded-full border border-white/30 bg-black/20 text-lg leading-none text-white backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            type="button"
          >
            <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
          </button>
        )}
      </motion.div>
    </>
  );
};
