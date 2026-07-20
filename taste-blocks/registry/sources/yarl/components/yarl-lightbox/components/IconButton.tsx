import * as React from "react";

import { clsx, cssClass, translateLabel } from "../utils.js";
import { useLightboxProps } from "../contexts/index.js";
import { ELEMENT_BUTTON, ELEMENT_ICON } from "../consts.js";
import { Label } from "../types.js";

export type IconButtonProps = React.ComponentProps<"button"> & {
  label: Label;
  icon: React.ElementType;
  renderIcon?: () => React.ReactNode;
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, icon: Icon, renderIcon, onClick, style, ...rest },
  ref,
) {
  const { styles, labels } = useLightboxProps();
  const buttonLabel = translateLabel(labels, label);

  return (
    <button
      ref={ref}
      type="button"
      title={buttonLabel}
      aria-label={buttonLabel}
      className={clsx(cssClass(ELEMENT_BUTTON), className)}
      onClick={onClick}
      style={{ ...style, ...styles.button }}
      {...rest}
    >
      {renderIcon ? renderIcon() : <Icon className={cssClass(ELEMENT_ICON)} style={styles.icon} />}
    </button>
  );
});
