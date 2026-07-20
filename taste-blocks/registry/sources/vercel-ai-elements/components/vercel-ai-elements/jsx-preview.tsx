"use client";

import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TProps as JsxParserProps } from "react-jsx-parser";
import JsxParser from "react-jsx-parser";

interface JSXPreviewContextValue {
  jsx: string;
  processedJsx: string;
  isStreaming: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  setLastGoodJsx: (jsx: string) => void;
  components: JsxParserProps["components"];
  bindings: JsxParserProps["bindings"];
  onErrorProp?: (error: Error) => void;
}

const JSXPreviewContext = createContext<JSXPreviewContextValue | null>(null);

const TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*?)(\/)?>/;

export const useJSXPreview = () => {
  const context = useContext(JSXPreviewContext);
  if (!context) {
    throw new Error("JSXPreview components must be used within JSXPreview");
  }
  return context;
};

const matchJsxTag = (code: string) => {
  if (code.trim() === "") {
    return null;
  }

  const match = code.match(TAG_REGEX);

  if (!match || match.index === undefined) {
    return null;
  }

  const [fullMatch, tagName, attributes, selfClosing] = match;

  let type: "self-closing" | "closing" | "opening";
  if (selfClosing) {
    type = "self-closing";
  } else if (fullMatch.startsWith("</")) {
    type = "closing";
  } else {
    type = "opening";
  }

  return {
    attributes: attributes.trim(),
    endIndex: match.index + fullMatch.length,
    startIndex: match.index,
    tag: fullMatch,
    tagName,
    type,
  };
};

const stripIncompleteTag = (text: string) => {
  // Find the last '<' that isn't part of a complete tag
  const lastOpen = text.lastIndexOf("<");
  if (lastOpen === -1) {
    return text;
  }

  const afterOpen = text.slice(lastOpen);
  // If there's no closing '>' after the last '<', it's an incomplete tag
  if (!afterOpen.includes(">")) {
    return text.slice(0, lastOpen);
  }

  return text;
};

const completeJsxTag = (code: string) => {
  const stack: string[] = [];
  let result = "";
  let currentPosition = 0;

  while (currentPosition < code.length) {
    const match = matchJsxTag(code.slice(currentPosition));
    if (!match) {
      // No more tags found, strip any trailing incomplete tag
      result += stripIncompleteTag(code.slice(currentPosition));
      break;
    }
    const { tagName, type, endIndex } = match;

    // Include any text content before this tag
    result += code.slice(currentPosition, currentPosition + endIndex);

    if (type === "opening") {
      stack.push(tagName);
    } else if (type === "closing") {
      stack.pop();
    }

    currentPosition += endIndex;
  }

  return (
    result +
    stack
      .toReversed()
      .map((tag) => `</${tag}>`)
      .join("")
  );
};

export type JSXPreviewProps = ComponentProps<"div"> & {
  jsx: string;
  isStreaming?: boolean;
  components?: JsxParserProps["components"];
  bindings?: JsxParserProps["bindings"];
  onError?: (error: Error) => void;
};

export const JSXPreview = memo(
  ({
    jsx,
    isStreaming = false,
    components,
    bindings,
    onError,
    className,
    children,
    ...props
  }: JSXPreviewProps) => {
    const [prevJsx, setPrevJsx] = useState(jsx);
    const [error, setError] = useState<Error | null>(null);
    const [_lastGoodJsx, setLastGoodJsx] = useState("");

    // Clear error when jsx changes (derived state pattern)
    if (jsx !== prevJsx) {
      setPrevJsx(jsx);
      setError(null);
    }

    const processedJsx = useMemo(
      () => (isStreaming ? completeJsxTag(jsx) : jsx),
      [jsx, isStreaming]
    );

    const contextValue = useMemo(
      () => ({
        bindings,
        components,
        error,
        isStreaming,
        jsx,
        onErrorProp: onError,
        processedJsx,
        setError,
        setLastGoodJsx,
      }),
      [
        bindings,
        components,
        error,
        isStreaming,
        jsx,
        onError,
        processedJsx,
        setError,
      ]
    );

    return (
      <JSXPreviewContext.Provider value={contextValue}>
        <div className={cn("relative", className)} {...props}>
          {children}
        </div>
      </JSXPreviewContext.Provider>
    );
  }
);

JSXPreview.displayName = "JSXPreview";

export type JSXPreviewContentProps = Omit<ComponentProps<"div">, "children">;

export const JSXPreviewContent = memo(
  ({ className, ...props }: JSXPreviewContentProps) => {
    const {
      processedJsx,
      isStreaming,
      components,
      bindings,
      setError,
      setLastGoodJsx,
      onErrorProp,
    } = useJSXPreview();
    const errorReportedRef = useRef<string | null>(null);
    const lastGoodJsxRef = useRef("");
    const [hadError, setHadError] = useState(false);

    // Reset error tracking when jsx changes
    useEffect(() => {
      errorReportedRef.current = null;
      setHadError(false);
    }, [processedJsx]);

    const handleError = useCallback(
      (err: Error) => {
        // Prevent duplicate error reports for the same jsx
        if (errorReportedRef.current === processedJsx) {
          return;
        }
        errorReportedRef.current = processedJsx;

        // During streaming, suppress errors and fall back to last good JSX
        if (isStreaming) {
          setHadError(true);
          return;
        }

        setError(err);
        onErrorProp?.(err);
      },
      [processedJsx, isStreaming, onErrorProp, setError]
    );

    // Track the last JSX that rendered without error
    useEffect(() => {
      if (!errorReportedRef.current) {
        lastGoodJsxRef.current = processedJsx;
        setLastGoodJsx(processedJsx);
      }
    }, [processedJsx, setLastGoodJsx]);

    // During streaming, if the current JSX errored, re-render with last good version
    const displayJsx =
      isStreaming && hadError ? lastGoodJsxRef.current : processedJsx;

    return (
      <div className={cn("jsx-preview-content", className)} {...props}>
        <JsxParser
          bindings={bindings}
          components={components}
          jsx={displayJsx}
          onError={handleError}
          renderInWrapper={false}
        />
      </div>
    );
  }
);

JSXPreviewContent.displayName = "JSXPreviewContent";

export type JSXPreviewErrorProps = ComponentProps<"div"> & {
  children?: ReactNode | ((error: Error) => ReactNode);
};

const renderChildren = (
  children: ReactNode | ((error: Error) => ReactNode),
  error: Error
): ReactNode => {
  if (typeof children === "function") {
    return children(error);
  }
  return children;
};

export const JSXPreviewError = memo(
  ({ className, children, ...props }: JSXPreviewErrorProps) => {
    const { error } = useJSXPreview();

    if (!error) {
      return null;
    }

    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm",
          className
        )}
        {...props}
      >
        {children ? (
          renderChildren(children, error)
        ) : (
          <>
            <AlertCircle className="size-4 shrink-0" />
            <span>{error.message}</span>
          </>
        )}
      </div>
    );
  }
);

JSXPreviewError.displayName = "JSXPreviewError";
