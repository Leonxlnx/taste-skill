import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./press-depth-button.css";

export interface PressDepthButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function PressDepthButton({
  children,
  className = "",
  type = "button",
  ...props
}: PressDepthButtonProps) {
  return (
    <button
      className={`tb-press-depth ${className}`.trim()}
      type={type}
      {...props}
    >
      <span className="tb-press-depth__face">{children}</span>
    </button>
  );
}
