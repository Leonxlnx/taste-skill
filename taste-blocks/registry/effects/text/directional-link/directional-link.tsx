import type { AnchorHTMLAttributes, ReactNode } from "react";
import "./directional-link.css";

export type DirectionalLinkDirection = "forward" | "back" | "external" | "download";

export interface DirectionalLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  direction?: DirectionalLinkDirection;
}

const arrows: Record<DirectionalLinkDirection, string> = {
  forward: "→",
  back: "←",
  external: "↗",
  download: "↓",
};

export function DirectionalLink({
  children,
  direction = "forward",
  className = "",
  ...props
}: DirectionalLinkProps) {
  return (
    <a
      {...props}
      className={`tb-directional-link ${className}`.trim()}
      data-direction={direction}
    >
      <span className="tb-directional-link__label">{children}</span>
      <span className="tb-directional-link__arrow" aria-hidden="true">
        {arrows[direction]}
      </span>
    </a>
  );
}

export default DirectionalLink;
