import {
  type CSSProperties,
  createElement,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
} from "react";
import {
  animateSlotText,
  clearSlotText,
  renderTextWithCssFallback,
  type SlotOptions,
} from "./slotText.js";
import "./style.css";

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export interface SlotTextProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> {
  text: string;
  options?: SlotOptions;
}

export const SlotText = forwardRef<HTMLSpanElement, SlotTextProps>(
  ({ text, options, "aria-label": ariaLabel, ...props }, forwardedRef) => {
    const elementRef = useRef<HTMLSpanElement>(null);
    const visualRef = useRef<HTMLSpanElement>(null);
    const initialTextRef = useRef(text);
    const mountedRef = useRef(false);
    const firstTextEffectRef = useRef(true);
    const optionsRef = useRef<SlotOptions | undefined>(options);

    useImperativeHandle(forwardedRef, () => elementRef.current!, []);

    useEffect(() => {
      optionsRef.current = options;
    }, [options]);

    useEffect(() => {
      const element = visualRef.current;
      if (!element) return;

      renderTextWithCssFallback(element, text);
      mountedRef.current = true;

      return () => {
        clearSlotText(element);
        mountedRef.current = false;
        firstTextEffectRef.current = true;
      };
    }, []);

    useEffect(() => {
      const element = visualRef.current;
      if (!element || !mountedRef.current) return;
      if (firstTextEffectRef.current) {
        firstTextEffectRef.current = false;
        return;
      }

      animateSlotText(element, text, optionsRef.current);
    }, [text]);

    return createElement(
      "span",
      {
        ...props,
        "aria-label": ariaLabel,
        ref: elementRef,
      },
      createElement("span", { style: visuallyHidden }, ariaLabel ?? text),
      createElement(
        "span",
        { "aria-hidden": "true", ref: visualRef },
        initialTextRef.current,
      ),
    );
  },
);

SlotText.displayName = "SlotText";
