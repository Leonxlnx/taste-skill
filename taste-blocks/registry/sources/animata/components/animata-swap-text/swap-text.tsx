"use client";

import { useState } from "react";

import { cn } from "../../lib/utils";

interface SwapTextProps extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * The initial text to display.
   */
  initialText: string;

  /**
   * The final text to display.
   */
  finalText: string;

  /**
   * Whether the component should toggle on hover as well as click.
   */
  supportsHover?: boolean;

  /**
   * The class name for the text.
   */
  textClassName?: string;

  /**
   * The class name for the initial text.
   */
  initialTextClassName?: string;

  /**
   * The class name for the final text.
   */
  finalTextClassName?: string;

  /**
   * Whether to disable the click interaction.
   */
  disableClick?: boolean;
}

export default function SwapText({
  initialText,
  finalText,
  className,
  supportsHover = true,
  textClassName,
  initialTextClassName,
  finalTextClassName,
  disableClick,
  // The rest of the props are passed to the container div.
  ...props
}: SwapTextProps) {
  const [active, setActive] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hoverEnabled = supportsHover && !disableClick;
  const visualActive = active || (hoverEnabled && (focused || hovering));
  const common =
    "block transition-transform duration-300 ease-slow motion-reduce:transition-none";

  const longWord = finalText.length > initialText.length ? finalText : null;

  return (
    <div {...props} className={cn("relative overflow-hidden text-foreground", className)}>
      <button
        type="button"
        aria-label={visualActive ? finalText : initialText}
        aria-pressed={active}
        disabled={disableClick}
        className={cn(
          "w-full touch-manipulation cursor-pointer select-none border-0 bg-transparent p-0 text-left text-3xl font-bold text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          textClassName,
        )}
        onClick={() => !disableClick && setActive((current) => !current)}
        onBlur={() => setFocused(false)}
        onFocus={() => hoverEnabled && setFocused(true)}
        onMouseEnter={() => hoverEnabled && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <span
          aria-hidden="true"
          className={cn(common, initialTextClassName, {
            "flex flex-col": true,
            "-translate-y-full": visualActive,
          })}
        >
          {initialText}
          {
            /* Trick to make sure it can always fit all available words after transition as the second word is set to absolute*/
            Boolean(longWord?.length) && <span className="invisible h-0">{longWord}</span>
          }
        </span>
        <span
          aria-hidden="true"
          className={cn(`${common} absolute top-full`, finalTextClassName, {
            "-translate-y-full": visualActive,
          })}
        >
          {finalText}
        </span>
      </button>
    </div>
  );
}
