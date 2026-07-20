import * as React from "react";
import { createPortal } from "react-dom";

import { ComponentProps } from "../types.js";
import { LightboxDefaultProps } from "../props.js";
import { createModule } from "../config.js";
import { clsx, composePrefix, cssClass, cssVar, reflow, translateLabel } from "../utils.js";
import { useEventCallback, useMotionPreference } from "../hooks/index.js";
import { useEvents, useTimeouts } from "../contexts/index.js";
import { LightboxRoot } from "../components/index.js";
import { ACTION_CLOSE, CLASS_NO_SCROLL_PADDING, MODULE_PORTAL } from "../consts.js";

function cssPrefix(value?: string) {
  return composePrefix(MODULE_PORTAL, value);
}

function setAttribute(element: Element, attribute: string, value: string) {
  const previousValue = element.getAttribute(attribute);

  element.setAttribute(attribute, value);

  return () => {
    if (previousValue) {
      element.setAttribute(attribute, previousValue);
    } else {
      element.removeAttribute(attribute);
    }
  };
}

export function Portal({
  portal: { root, container: { className: containerClassName, style: containerStyle, ...containerRest } = {} },
  animation,
  styles,
  className,
  on,
  close,
  labels,
  children,
}: ComponentProps) {
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const cleanup = React.useRef<(() => void)[]>([]);
  const restoreFocus = React.useRef<Element>(null);

  const { setTimeout } = useTimeouts();
  const { subscribe } = useEvents();

  const reduceMotion = useMotionPreference();
  const animationDuration = !reduceMotion ? animation.fade : 0;

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
      setVisible(false);
    };
  }, []);

  const handleCleanup = useEventCallback(() => {
    cleanup.current.forEach((clean) => clean());
    cleanup.current = [];
  });

  const handleClose = useEventCallback(() => {
    setVisible(false);

    handleCleanup();

    on.exiting?.();

    setTimeout(() => {
      on.exited?.();

      close();
    }, animationDuration);
  });

  React.useEffect(() => subscribe(ACTION_CLOSE, handleClose), [subscribe, handleClose]);

  const handleEnter = useEventCallback((node: HTMLDivElement) => {
    reflow(node);

    setVisible(true);

    on.entering?.();

    const elements = node.parentNode?.children ?? [];
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      if (["TEMPLATE", "SCRIPT", "STYLE"].indexOf(element.tagName) === -1 && element !== node) {
        cleanup.current.push(setAttribute(element, "inert", ""));
        cleanup.current.push(setAttribute(element, "aria-hidden", "true"));
      }
    }

    cleanup.current.push(() => {
      (restoreFocus.current as HTMLElement | null)?.focus?.();
    });

    setTimeout(() => {
      on.entered?.();
    }, animationDuration);
  });

  const handleRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        handleEnter(node);
      } else {
        handleCleanup();
      }
    },
    [handleEnter, handleCleanup],
  );

  return mounted
    ? createPortal(
        <LightboxRoot
          ref={handleRef}
          className={clsx(
            className,
            containerClassName,
            cssClass(cssPrefix()),
            cssClass(CLASS_NO_SCROLL_PADDING),
            visible && cssClass(cssPrefix("open")),
          )}
          aria-modal
          role="dialog"
          aria-label={translateLabel(labels, "Lightbox")}
          style={{
            ...(animation.fade !== LightboxDefaultProps.animation.fade
              ? { [cssVar("fade_animation_duration")]: `${animationDuration}ms` }
              : null),
            ...(animation.easing.fade !== LightboxDefaultProps.animation.easing.fade
              ? { [cssVar("fade_animation_timing_function")]: animation.easing.fade }
              : null),
            ...styles.root,
            ...containerStyle,
          }}
          onFocus={(event) => {
            if (!restoreFocus.current) {
              restoreFocus.current = event.relatedTarget;
            }
          }}
          {...containerRest}
        >
          {children}
        </LightboxRoot>,
        (typeof root === "function" ? root() : root) || document.body,
      )
    : null;
}

export const PortalModule = createModule(MODULE_PORTAL, Portal);
