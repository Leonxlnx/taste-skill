import {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
  type RefObject,
} from "react";
import type React from "react";
import rangeAtIndex from "./vendor/range-at-index.js";
import {
  hasPercentageUnit,
  stopPropagation,
  syncBackdropStyle,
} from "./dom.js";
import { type SelectionRange, initSelectionStore } from "./selection.js";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";
import type { CaretPosition, Renderer } from "./types.js";
import { CARET_DETECTOR, refKey } from "./utils.js";
import { useStatic } from "./useStatic.js";
import { type TextareaRect, createTextareaObserver } from "./observer.js";

type BackdropHandle = (value: string) => void;

const Backdrop /*#__PURE__*/ = memo(
  ({
    _ref: backdropRef,
    _handle: handle,
    _render: render,
    _width: width,
  }: {
    _ref: RefObject<HTMLDivElement | null>;
    _handle: RefObject<BackdropHandle | null>;
    _render: Renderer | undefined;
    _width: number;
  }) => {
    const [value, setValue] = useState("");

    useImperativeHandle(handle, () => setValue, []);

    return (
      <div
        ref={backdropRef}
        aria-hidden
        style={useMemo(
          (): React.CSSProperties => ({
            width,
            transform: "translate(0px, 0px)",
            pointerEvents: "none",
            userSelect: "none",
            msUserSelect: "none",
            WebkitUserSelect: "none",
            // https://github.com/inokawa/rich-textarea/issues/56
            boxSizing: "content-box",
            // https://stackoverflow.com/questions/2545542/font-size-rendering-inconsistencies-on-an-iphone
            textSizeAdjust: "100%",
            WebkitTextSizeAdjust: "100%",
            MozTextSizeAdjust: "100%",
          }),
          [width],
        )}
        // Stop propagation of events dispatched on backdrop
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
        onMouseOver={stopPropagation}
        onMouseOut={stopPropagation}
        onMouseMove={stopPropagation}
      >
        {useMemo(() => (render ? render(value) : value), [value, render])}
        {CARET_DETECTOR}
      </div>
    );
  },
);

/**
 * Methods of {@link RichTextarea}.
 *
 * All the others not mentioned are proxied to ref of [textarea](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement).
 *
 * | Name              | Type     | Description                                                               |
 * | ----------------- | -------- | ------------------------------------------------------------------------- |
 * | selectionStart    | `number` | Same as original but has handling of composition event                    |
 * | selectionEnd      | `number` | Same as original but has handling of composition event                    |
 * | setRangeText      |          | Same as original but has fallback to `document.execCommand("insertText")` |
 */
export interface RichTextareaHandle extends HTMLTextAreaElement {}

/**
 * Props of {@link RichTextarea}.
 *
 * For other props not mentioned below will be passed to [textarea](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement).
 */
export interface RichTextareaProps
  extends Omit<React.ComponentProps<"textarea">, "children"> {
  /**
   *
   * Render function to create customized view from value.
   *
   * This function should return ReactNodes which texts are positioned the same as textarea (see examples for detailed usage).
   *
   * On the rendered nodes, currently limited event handlers will work.
   * - `onClick`
   * - `onMouseOver`
   * - `onMouseOut`
   * - `onMouseMove`
   * - `onMouseDown`
   * - `onMouseUp`
   * @defaultValue undefined
   */
  children?: Renderer;
  /**
   * If true, textarea height is automatically resized and height of style prop does not work.
   * Set `maxHeight` to style prop if you need limit.
   * Set `rows` prop to 1 if you need single-line textarea.
   * @defaultValue undefined
   */
  autoHeight?: boolean;
  /**
   * Called when selection in textarea changes. It gives position of caret at the time, which is useful to position menu.
   * @defaultValue undefined
   */
  onSelectionChange?: (pos: CaretPosition) => void;
}

/**
 * Textarea component with some extra props. See {@link RichTextareaProps} and {@link RichTextareaHandle}.
 */
export const RichTextarea = /*#__PURE__*/ forwardRef<
  RichTextareaHandle,
  RichTextareaProps
>(
  (
    {
      children: render,
      autoHeight,
      style,
      onChange,
      onKeyDown,
      onSelectionChange,
      ...props
    },
    ref,
  ): React.ReactElement => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const backdropHandle = useRef<BackdropHandle>(null);
    const [[width, height, hPadding, vPadding], setRect] =
      useState<TextareaRect>([0, 0, 0, 0]);
    const [focused, setFocused] = useState<boolean>(false);

    const caretColorRef = useRef("");

    const [[selectionStart, selectionEnd], setSelection] =
      useState<SelectionRange>([null, null]);
    const selectionStore = useStatic(() =>
      initSelectionStore(textAreaRef, setSelection),
    );

    const totalWidth = width + hPadding;
    const totalHeight = height + vPadding;

    const isSizeCalculated = !!(totalWidth + totalHeight);

    useImperativeHandle(ref, () => {
      const el = textAreaRef[refKey]!;
      const overrides = {
        get selectionStart() {
          return selectionStore._getSelectionStart();
        },
        get selectionEnd() {
          return selectionStore._getSelectionEnd();
        },
        setRangeText(
          text: string,
          start: number,
          end: number,
          preserve?: SelectionMode,
        ) {
          if (el.setRangeText) {
            el.setRangeText(text, start, end, preserve);
          } else {
            el.focus();
            el.selectionStart = start;
            el.selectionEnd = end;
            document.execCommand("insertText", false, text);
          }
          // Invoke onChange to lift state up
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
      };

      return new Proxy(el, {
        get(target, prop: keyof HTMLTextAreaElement) {
          if ((overrides as any)[prop]) {
            return (overrides as any)[prop];
          }
          const value = target[prop];
          return typeof value === "function" ? value.bind(target) : value;
        },
        set(target, prop, value) {
          (target as any)[prop] = value;
          return true;
        },
      }) as HTMLTextAreaElement;
    }, []);

    useIsomorphicLayoutEffect(() => {
      const textarea = textAreaRef[refKey];
      const backdrop = backdropRef[refKey];
      if (!textarea || !backdrop) return;

      return createTextareaObserver(
        textarea,
        backdrop,
        selectionStore,
        setRect,
        setFocused,
      );
    }, []);

    useIsomorphicLayoutEffect(() => {
      const textarea = textAreaRef[refKey];
      if (!textarea) return;
      // Sync value on init and change
      backdropHandle[refKey]!(textarea.value);
    }, [props.value]);

    useIsomorphicLayoutEffect(() => {
      // Sync backdrop style
      const textarea = textAreaRef[refKey];
      const backdrop = backdropRef[refKey];
      if (!backdrop || !textarea) return;
      syncBackdropStyle(textarea, backdrop, caretColorRef, style);
    }, [style]);

    useEffect(() => {
      if (selectionStart == null || selectionEnd == null || !onSelectionChange)
        return;
      if (!focused) {
        onSelectionChange({
          focused: false,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
        });
      } else {
        const range = rangeAtIndex(
          backdropRef[refKey]!,
          selectionStart,
          selectionStart + 1,
        ) as Range;
        const rect = range.getBoundingClientRect();
        onSelectionChange({
          focused: true,
          top: rect.top,
          left: rect.left,
          height: rect.height,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
        });
      }
    }, [focused, selectionStart, selectionEnd]);

    useEffect(() => {
      const textarea = textAreaRef[refKey];
      if (!autoHeight || !textarea) return;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });

    return (
      <div
        style={useMemo((): React.CSSProperties => {
          let w: React.CSSProperties["width"] = totalWidth;
          let h: React.CSSProperties["height"] = totalHeight;
          // Prefer prop style to avoid miscalculation https://github.com/inokawa/rich-textarea/issues/39
          if (style) {
            if (hasPercentageUnit(style.width)) {
              w = style.width;
            }
            if (hasPercentageUnit(style.height)) {
              h = style.height;
            }
          }
          return {
            display: "inline-block",
            position: "relative",
            width: w,
            height: h,
          };
        }, [totalWidth, totalHeight, style])}
      >
        <div
          style={useMemo((): React.CSSProperties => {
            const s: React.CSSProperties = {
              position: "absolute",
              overflow: "hidden",
              top: 0,
              left: 0,
              width: totalWidth,
              height: totalHeight,
            };
            if (!style) return s;
            (["background", "backgroundColor"] as const).forEach((k) => {
              if (style[k]) s[k] = style[k] as any;
            });
            return s;
          }, [totalWidth, totalHeight, style])}
        >
          <Backdrop
            _ref={backdropRef}
            _handle={backdropHandle}
            _render={render}
            _width={width}
          />
        </div>
        <textarea
          {...props}
          ref={textAreaRef}
          style={useMemo(
            () => ({
              ...style,
              background: "transparent",
              margin: 0,
              // Set `position: absolute` to fix bug that sometimes texts disappear in Chrome for unknown reason
              position: "absolute",
              // And remove it until element size is calculated to avoid layout shift on mount
              // https://github.com/inokawa/rich-textarea/issues/21
              ...(!isSizeCalculated && {
                position: undefined,
                verticalAlign: "top",
              }),
            }),
            [style, isSizeCalculated],
          )}
          onChange={useCallback(
            (e: React.ChangeEvent<HTMLTextAreaElement>) => {
              backdropHandle[refKey]?.(e.target.value);
              onChange?.(e);
            },
            [onChange],
          )}
          onKeyDown={useCallback(
            (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              // Ignore keydown events during IME composition.
              // Safari sometimes fires keydown event after compositionend so also ignore it.
              // https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event#ignoring_keydown_during_ime_composition
              if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) {
                return;
              }

              onKeyDown?.(e);
              selectionStore._updateSeletion();
            },
            [onKeyDown],
          )}
        />
      </div>
    );
  },
);
