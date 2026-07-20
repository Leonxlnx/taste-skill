import * as React from "react";

import { ComponentProps, Label, RenderFunction } from "../../types.js";
import { createModule } from "../../config.js";
import { useLoseFocus } from "../../hooks/index.js";
import { cssClass } from "../../utils.js";
import { IconButton, NextIcon, PreviousIcon } from "../../components/index.js";
import { useController } from "../Controller/index.js";
import { ACTION_NEXT, ACTION_PREV, MODULE_NAVIGATION } from "../../consts.js";
import { useNavigationState } from "./useNavigationState.js";
import { useKeyboardNavigation } from "./useKeyboardNavigation.js";

export type NavigationButtonProps = {
  label: Label;
  icon: React.ElementType;
  renderIcon?: RenderFunction;
  action: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export function NavigationButton({ label, icon, renderIcon, action, onClick, disabled, style }: NavigationButtonProps) {
  return (
    <IconButton
      label={label}
      icon={icon}
      renderIcon={renderIcon}
      className={cssClass(`navigation_${action}`)}
      disabled={disabled}
      onClick={onClick}
      style={style}
      {...useLoseFocus(useController().focus, disabled)}
    />
  );
}

export function Navigation({ render: { buttonPrev, buttonNext, iconPrev, iconNext }, styles }: ComponentProps) {
  const { prev, next, subscribeSensors } = useController();
  const { prevDisabled, nextDisabled } = useNavigationState();

  useKeyboardNavigation(subscribeSensors);

  return (
    <>
      {buttonPrev ? (
        buttonPrev()
      ) : (
        <NavigationButton
          label="Previous"
          action={ACTION_PREV}
          icon={PreviousIcon}
          renderIcon={iconPrev}
          style={styles.navigationPrev}
          disabled={prevDisabled}
          onClick={prev}
        />
      )}

      {buttonNext ? (
        buttonNext()
      ) : (
        <NavigationButton
          label="Next"
          action={ACTION_NEXT}
          icon={NextIcon}
          renderIcon={iconNext}
          style={styles.navigationNext}
          disabled={nextDisabled}
          onClick={next}
        />
      )}
    </>
  );
}

export const NavigationModule = createModule(MODULE_NAVIGATION, Navigation);
