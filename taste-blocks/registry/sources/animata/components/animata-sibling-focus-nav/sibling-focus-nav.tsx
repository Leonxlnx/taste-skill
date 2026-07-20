import { type ComponentProps, createContext, use } from "react";

import { cn } from "../../lib/utils";

export type SiblingFocusNavMode = "opacity" | "blur";

const SiblingFocusNavModeContext = createContext<SiblingFocusNavMode>("opacity");

/** Opacity mode: dim siblings only while a link is hovered or focus-visible. */
export const siblingFocusNavOpacityGroupClassName = cn(
  "[&:has(>a:hover)>a:not(:hover)]:opacity-30",
  "[&:has(>a:focus-visible)>a:not(:focus-visible)]:opacity-30",
);

/** Blur mode: same sibling trick, but with blur-sm instead of opacity. */
const siblingFocusNavBlurGroupClassName = cn(
  "[&:has(>a:hover)>a:not(:hover)]:blur-sm",
  "[&:has(>a:focus-visible)>a:not(:focus-visible)]:blur-sm",
  "motion-reduce:[&:has(>a:hover)>a:not(:hover)]:blur-none",
  "motion-reduce:[&:has(>a:focus-visible)>a:not(:focus-visible)]:blur-none",
);

const siblingFocusNavLinkBaseClassName = cn(
  "inline-flex min-h-11 touch-manipulation items-center outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

/** Classes for direct-child links. Merge onto Next.js Link or use SiblingFocusNav.Link. */
export function siblingFocusNavLinkClassName(mode: SiblingFocusNavMode = "opacity") {
  return cn(
    siblingFocusNavLinkBaseClassName,
    mode === "opacity"
      ? "transition-opacity duration-200 ease-out motion-reduce:transition-none"
      : "blur-0 transition-[filter] duration-200 ease-out motion-reduce:transition-none",
  );
}

export function siblingFocusNavGroupClassName(mode: SiblingFocusNavMode = "opacity") {
  return mode === "blur" ? siblingFocusNavBlurGroupClassName : siblingFocusNavOpacityGroupClassName;
}

/** Horizontal separation — padding on links so hover survives the space between items. */
export const siblingFocusNavSpacingXClassName = "[&>a:not(:last-child)]:pe-6";

/** Vertical separation — same idea for stacked nav rows. */
export const siblingFocusNavSpacingYClassName = "[&>a:not(:last-child)]:pb-2.5";

type SiblingFocusNavSpacingAxis = "x" | "y" | "none";

type SiblingFocusNavRootProps = ComponentProps<"nav"> & {
  mode?: SiblingFocusNavMode;
  /** Padding-based link separation — keeps hover active between items (no flex gap). */
  spacingAxis?: SiblingFocusNavSpacingAxis;
};

function siblingFocusNavSpacingClassName(axis: SiblingFocusNavSpacingAxis) {
  if (axis === "y") return siblingFocusNavSpacingYClassName;
  if (axis === "none") return undefined;
  return siblingFocusNavSpacingXClassName;
}

function SiblingFocusNavRoot({
  mode = "opacity",
  spacingAxis = "x",
  className,
  ...props
}: SiblingFocusNavRootProps) {
  return (
    <SiblingFocusNavModeContext.Provider value={mode}>
      <nav
        className={cn(
          "flex flex-wrap items-center",
          siblingFocusNavSpacingClassName(spacingAxis),
          siblingFocusNavGroupClassName(mode),
          className,
        )}
        {...props}
      />
    </SiblingFocusNavModeContext.Provider>
  );
}

type SiblingFocusNavLinkProps = ComponentProps<"a"> & {
  mode?: SiblingFocusNavMode;
};

function SiblingFocusNavLink({ mode, className, ...props }: SiblingFocusNavLinkProps) {
  const contextMode = use(SiblingFocusNavModeContext);
  const resolvedMode = mode ?? contextMode;

  return <a className={cn(siblingFocusNavLinkClassName(resolvedMode), className)} {...props} />;
}

const SiblingFocusNav = Object.assign(SiblingFocusNavRoot, {
  Link: SiblingFocusNavLink,
  linkClassName: siblingFocusNavLinkClassName("opacity"),
  groupClassName: siblingFocusNavOpacityGroupClassName,
  getLinkClassName: siblingFocusNavLinkClassName,
  getGroupClassName: siblingFocusNavGroupClassName,
  spacingXClassName: siblingFocusNavSpacingXClassName,
  spacingYClassName: siblingFocusNavSpacingYClassName,
});

export default SiblingFocusNav;
export { SiblingFocusNavLink };
