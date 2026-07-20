export {
  animateSlotText,
  buildSlotText,
  chromatic,
  clearSlotText,
  type ChromaticOptions,
  type SlotOptions,
} from "./slotText.js";

import { TUNING } from "./constants.js";
import {
  animateSlotText,
  clearSlotText,
  renderTextWithCssFallback,
  type SlotOptions,
} from "./slotText.js";

export interface FlashOptions {
  /** How long the flash text stays before rolling back, in ms (default 1400). */
  revertAfter?: number;
  /** Roll options for the flash text rolling in. */
  enter?: SlotOptions;
  /** Roll options for the original text rolling back. */
  exit?: SlotOptions;
}

export interface SlotTextController {
  readonly element: HTMLElement;
  /** The text currently displayed (the flash text while a flash is showing). */
  readonly value: string;
  /** Roll to new text. Cancels any pending flash revert. */
  set(text: string, options?: SlotOptions): void;
  /**
   * Roll to temporary text, then roll back automatically — the classic
   * Copy → Copied → Copy button in one call. Spam-safe: repeat flashes restart
   * the revert timer instead of queuing extra rolls.
   */
  flash(text: string, options?: FlashOptions): void;
  destroy(): void;
}

/**
 * Create a text-roll controller for one element.
 *
 * Import `slot-text/style.css` once in your app, then call:
 *
 *   const label = slotText(buttonLabel, "Copy");
 *   label.set("Copied", { direction: "up" });
 *   label.flash("Copied", { revertAfter: 1400 }); // auto-reverts to "Copy"
 */
export function slotText(
  element: HTMLElement,
  initialText: string,
  defaultOptions: SlotOptions = {},
): SlotTextController {
  let currentValue = initialText;
  let revertTimerId: number | undefined;
  let restingText: string | undefined;
  renderTextWithCssFallback(element, initialText);
  const animateWithoutInterrupt = (text: string, overrides?: SlotOptions) =>
    animateSlotText(element, text, {
      ...defaultOptions,
      interrupt: false,
      ...overrides,
    });

  return {
    element,
    get value() {
      return currentValue;
    },
    set(text, optionOverrides = {}) {
      // An explicit set wins over a pending flash revert.
      clearTimeout(revertTimerId);
      restingText = undefined;
      currentValue = text;
      animateSlotText(element, text, {
        ...defaultOptions,
        ...optionOverrides,
      });
    },
    flash(
      text,
      {
        revertAfter = TUNING.lifecycle.flashRevertDelayMs,
        enter: enterOptions,
        exit: exitOptions,
      } = {},
    ) {
      // Capture the resting text only on the first flash of a burst, so a
      // flash-during-flash still reverts to the original label.
      if (restingText === undefined) {
        restingText = currentValue;
      }

      // Flashes default to non-interrupting rolls: spam-friendly, no mid-roll
      // cutoffs. Callers can still override via `enter`/`exit`.
      currentValue = text;
      animateWithoutInterrupt(text, enterOptions);

      // Restart the revert timer: one revert per burst, after the last flash.
      clearTimeout(revertTimerId);
      revertTimerId = window.setTimeout(() => {
        const originalText = restingText!;
        restingText = undefined;
        revertTimerId = undefined;
        currentValue = originalText;
        animateWithoutInterrupt(originalText, exitOptions);
      }, revertAfter);
    },
    destroy() {
      clearTimeout(revertTimerId);
      clearSlotText(element, currentValue);
    },
  };
}
