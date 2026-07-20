"use client"

import { useId } from "react"

import { cn } from "../../lib/utils"

export const DistortedGlass = ({ className }: { className?: string }) => {
  const filterId = `distorted-glass-${useId().replaceAll(":", "")}`

  return (
    <div
      className={cn(
        "relative h-[50px] w-full overflow-hidden rounded-b-2xl",
        className
      )}
    >
      <div className="pointer-events-none absolute bottom-0 z-10 size-full overflow-hidden rounded-b-2xl border border-[#f5f5f51a]">
        <div
          className="size-full"
          style={{
            backdropFilter: "blur(0px)",
            background:
              "repeating-radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0), rgba(255, 255, 255, 0.2) 10px, rgb(255 255 255) 31px)",
            backgroundSize: "6px 6px",
            filter: `url(#${filterId})`,
          }}
        />
      </div>
      <svg aria-hidden="true" className="absolute size-0" focusable="false">
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.12 0.12"
              numOctaves="1"
              result="warp"
            />
            <feDisplacementMap
              xChannelSelector="R"
              yChannelSelector="G"
              scale="30"
              in="SourceGraphic"
              in2="warp"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
