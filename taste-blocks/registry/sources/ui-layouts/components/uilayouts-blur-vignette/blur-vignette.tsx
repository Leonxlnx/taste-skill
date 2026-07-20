"use client";

import type React from "react";
import { createContext, useContext } from "react";

import { cn } from "../../lib/utils";
import "./blur-vignette.css";

interface BlurVignetteContextProps {
  radius?: string;
  inset?: string;
  transitionLength?: string;
  blur?: string;
}

const BlurVignetteContext = createContext<BlurVignetteContextProps>({
  radius: "24px",
  inset: "20px",
  transitionLength: "44px",
  blur: "6px",
});

export const useBlurVignetteContext = () => useContext(BlurVignetteContext);

interface BlurVignetteProps {
  classname?: string;
  children: React.ReactNode;
  radius?: string;
  inset?: string;
  transitionLength?: string;
  blur?: string;
  blurclassname?: string;
}

export const BlurVignette: React.FC<BlurVignetteProps> = ({
  classname,
  children,
  radius = "24px",
  inset = "20px",
  transitionLength = "44px",
  blur = "6px",
}) => {
  return (
    <BlurVignetteContext.Provider value={{ radius, inset, transitionLength, blur }}>
      <div
        className={cn("relative aspect-square overflow-hidden", classname)}
        style={{ borderRadius: radius }}
      >
        {children}
      </div>
    </BlurVignetteContext.Provider>
  );
};

interface BlurVignetteArticleProps {
  children?: React.ReactNode;
  classname?: string;
}

export const BlurVignetteArticle: React.FC<BlurVignetteArticleProps> = ({
  children,
  classname,
}) => {
  const { radius, inset, transitionLength, blur } = useBlurVignetteContext();

  return (
    <div
      aria-hidden={children ? undefined : true}
      className={cn("blur-vignette bottom-0 left-0 z-1 h-full w-full", classname)}
      style={
        {
          "--radius": radius,
          "--inset": inset,
          "--transition-length": transitionLength,
          "--blur": blur,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};
