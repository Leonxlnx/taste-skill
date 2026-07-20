"use client";

import { type ImgHTMLAttributes, useState } from "react";

import { cn } from "../../lib/utils";

interface DiscloseImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Class name for both sliding panels. */
  doorClassName?: string;

  /** If true, the panels slide vertically. */
  vertical?: boolean;
}

export default function DiscloseImage({
  className,
  doorClassName,
  onLoad,
  vertical = false,
  ...props
}: DiscloseImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const baseClassName =
    "ease-slow duration-mid absolute bg-sky-500 transition-transform motion-reduce:hidden";

  return (
    <div className="relative aspect-[13/16] w-full overflow-hidden rounded-md bg-yellow-100">
      {/* Use `next/image` and remove the line below. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        {...props}
        onLoad={(event) => {
          setImageLoaded(true);
          onLoad?.(event);
        }}
        className={cn("h-full w-full object-cover", className)}
      />

      <div
        aria-hidden="true"
        className={cn(baseClassName, doorClassName, {
          "top-0 h-1/2 w-full": vertical,
          "-translate-y-full": vertical && imageLoaded,
          "inset-y-0 left-0 w-1/2": !vertical,
          "-translate-x-full": !vertical && imageLoaded,
        })}
      />
      <div
        aria-hidden="true"
        className={cn(baseClassName, doorClassName, {
          "bottom-0 h-1/2 w-full": vertical,
          "translate-y-full": vertical && imageLoaded,
          "inset-y-0 right-0 w-1/2": !vertical,
          "translate-x-full": !vertical && imageLoaded,
        })}
      />
    </div>
  );
}
