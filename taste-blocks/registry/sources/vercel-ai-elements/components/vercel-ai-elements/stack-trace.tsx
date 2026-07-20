"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
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

// Regex patterns for parsing stack traces
const STACK_FRAME_WITH_PARENS_REGEX = /^at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/;
const STACK_FRAME_WITHOUT_FN_REGEX = /^at\s+(.+):(\d+):(\d+)$/;
const ERROR_TYPE_REGEX = /^(\w+Error|Error):\s*(.*)$/;
const AT_PREFIX_REGEX = /^at\s+/;

interface StackFrame {
  raw: string;
  functionName: string | null;
  filePath: string | null;
  lineNumber: number | null;
  columnNumber: number | null;
  isInternal: boolean;
}

interface ParsedStackTrace {
  errorType: string | null;
  errorMessage: string;
  frames: StackFrame[];
  raw: string;
}

interface StackTraceContextValue {
  trace: ParsedStackTrace;
  raw: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
}

const StackTraceContext = createContext<StackTraceContextValue | null>(null);

const useStackTrace = () => {
  const context = useContext(StackTraceContext);
  if (!context) {
    throw new Error("StackTrace components must be used within StackTrace");
  }
  return context;
};

const parseStackFrame = (line: string): StackFrame => {
  const trimmed = line.trim();

  // Pattern: at functionName (filePath:line:column)
  const withParensMatch = trimmed.match(STACK_FRAME_WITH_PARENS_REGEX);
  if (withParensMatch) {
    const [, functionName, filePath, lineNum, colNum] = withParensMatch;
    const isInternal =
      filePath.includes("node_modules") ||
      filePath.startsWith("node:") ||
      filePath.includes("internal/");
    return {
      columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
      filePath: filePath ?? null,
      functionName: functionName ?? null,
      isInternal,
      lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
      raw: trimmed,
    };
  }

  // Pattern: at filePath:line:column (no function name)
  const withoutFnMatch = trimmed.match(STACK_FRAME_WITHOUT_FN_REGEX);
  if (withoutFnMatch) {
    const [, filePath, lineNum, colNum] = withoutFnMatch;
    const isInternal =
      (filePath?.includes("node_modules") ?? false) ||
      (filePath?.startsWith("node:") ?? false) ||
      (filePath?.includes("internal/") ?? false);
    return {
      columnNumber: colNum ? Number.parseInt(colNum, 10) : null,
      filePath: filePath ?? null,
      functionName: null,
      isInternal,
      lineNumber: lineNum ? Number.parseInt(lineNum, 10) : null,
      raw: trimmed,
    };
  }

  // Fallback: unparseable line
  return {
    columnNumber: null,
    filePath: null,
    functionName: null,
    isInternal: trimmed.includes("node_modules") || trimmed.includes("node:"),
    lineNumber: null,
    raw: trimmed,
  };
};

const parseStackTrace = (trace: string): ParsedStackTrace => {
  const lines = trace.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      errorMessage: trace,
      errorType: null,
      frames: [],
      raw: trace,
    };
  }

  const firstLine = lines[0].trim();
  let errorType: string | null = null;
  let errorMessage = firstLine;

  // Try to extract error type from "ErrorType: message" format
  const errorMatch = firstLine.match(ERROR_TYPE_REGEX);
  if (errorMatch) {
    const [, type, msg] = errorMatch;
    errorType = type;
    errorMessage = msg || "";
  }

  // Parse stack frames (lines starting with "at")
  const frames = lines
    .slice(1)
    .filter((line) => line.trim().startsWith("at "))
    .map(parseStackFrame);

  return {
    errorMessage,
    errorType,
    frames,
    raw: trace,
  };
};

export type StackTraceProps = ComponentProps<"div"> & {
  trace: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onFilePathClick?: (filePath: string, line?: number, column?: number) => void;
};

export const StackTrace = memo(
  ({
    trace,
    className,
    open,
    defaultOpen = false,
    onOpenChange,
    onFilePathClick,
    children,
    ...props
  }: StackTraceProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    });

    const parsedTrace = useMemo(() => parseStackTrace(trace), [trace]);

    const contextValue = useMemo(
      () => ({
        isOpen,
        onFilePathClick,
        raw: trace,
        setIsOpen,
        trace: parsedTrace,
      }),
      [parsedTrace, trace, isOpen, setIsOpen, onFilePathClick]
    );

    return (
      <StackTraceContext.Provider value={contextValue}>
        <div
          className={cn(
            "not-prose w-full overflow-hidden rounded-lg border bg-background font-mono text-sm",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </StackTraceContext.Provider>
    );
  }
);

export type StackTraceHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

export const StackTraceHeader = memo(
  ({ className, children, ...props }: StackTraceHeaderProps) => {
    const { isOpen, setIsOpen } = useStackTrace();

    return (
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger asChild {...props}>
          <div
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 p-3 text-start transition-colors hover:bg-muted/50 motion-reduce:transition-none",
              className
            )}
          >
            {children}
          </div>
        </CollapsibleTrigger>
      </Collapsible>
    );
  }
);

export type StackTraceErrorProps = ComponentProps<"div">;

export const StackTraceError = memo(
  ({ className, children, ...props }: StackTraceErrorProps) => (
    <div
      className={cn(
        "flex flex-1 items-center gap-2 overflow-hidden",
        className
      )}
      {...props}
    >
      <AlertTriangleIcon className="size-4 shrink-0 text-destructive" />
      {children}
    </div>
  )
);

export type StackTraceErrorTypeProps = ComponentProps<"span">;

export const StackTraceErrorType = memo(
  ({ className, children, ...props }: StackTraceErrorTypeProps) => {
    const { trace } = useStackTrace();

    return (
      <span
        className={cn("shrink-0 font-semibold text-destructive", className)}
        {...props}
      >
        {children ?? trace.errorType}
      </span>
    );
  }
);

export type StackTraceErrorMessageProps = ComponentProps<"span">;

export const StackTraceErrorMessage = memo(
  ({ className, children, ...props }: StackTraceErrorMessageProps) => {
    const { trace } = useStackTrace();

    return (
      <span className={cn("truncate text-foreground", className)} {...props}>
        {children ?? trace.errorMessage}
      </span>
    );
  }
);

export type StackTraceActionsProps = ComponentProps<"div">;

const handleActionsClick = (e: React.MouseEvent) => e.stopPropagation();
const handleActionsKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.stopPropagation();
  }
};

export const StackTraceActions = memo(
  ({ className, children, ...props }: StackTraceActionsProps) => (
    <div
      className={cn("flex shrink-0 items-center gap-1", className)}
      onClick={handleActionsClick}
      onKeyDown={handleActionsKeyDown}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
);

export type StackTraceCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const StackTraceCopyButton = memo(
  ({
    onCopy,
    onError,
    timeout = 2000,
    className,
    children,
    ...props
  }: StackTraceCopyButtonProps) => {
    const [isCopied, setIsCopied] = useState(false);
    const timeoutRef = useRef<number>(0);
    const { raw } = useStackTrace();

    const copyToClipboard = useCallback(async () => {
      if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
        onError?.(new Error("Clipboard API not available"));
        return;
      }

      try {
        await navigator.clipboard.writeText(raw);
        setIsCopied(true);
        onCopy?.();
        timeoutRef.current = window.setTimeout(
          () => setIsCopied(false),
          timeout
        );
      } catch (error) {
        onError?.(error as Error);
      }
    }, [raw, onCopy, onError, timeout]);

    useEffect(
      () => () => {
        window.clearTimeout(timeoutRef.current);
      },
      []
    );

    const Icon = isCopied ? CheckIcon : CopyIcon;

    return (
      <Button
        className={cn("size-7", className)}
        onClick={copyToClipboard}
        size="icon"
        variant="ghost"
        {...props}
      >
        {children ?? <Icon size={14} />}
      </Button>
    );
  }
);

export type StackTraceExpandButtonProps = ComponentProps<"div">;

export const StackTraceExpandButton = memo(
  ({ className, ...props }: StackTraceExpandButtonProps) => {
    const { isOpen } = useStackTrace();

    return (
      <div
        className={cn("flex size-7 items-center justify-center", className)}
        {...props}
      >
        <ChevronDownIcon
          className={cn(
            "size-4 text-muted-foreground transition-transform motion-reduce:transition-none",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </div>
    );
  }
);

export type StackTraceContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  maxHeight?: number;
};

export const StackTraceContent = memo(
  ({
    className,
    maxHeight = 400,
    children,
    ...props
  }: StackTraceContentProps) => {
    const { isOpen } = useStackTrace();

    return (
      <Collapsible open={isOpen}>
        <CollapsibleContent
          className={cn(
            "overflow-auto border-t bg-muted/30",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=open]:animate-in motion-reduce:animate-none",
            className
          )}
          style={{ maxHeight }}
          {...props}
        >
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  }
);

export type StackTraceFramesProps = ComponentProps<"div"> & {
  showInternalFrames?: boolean;
};

interface FilePathButtonProps {
  frame: StackFrame;
  onFilePathClick?: (
    filePath: string,
    lineNumber?: number,
    columnNumber?: number
  ) => void;
}

const FilePathButton = memo(
  ({ frame, onFilePathClick }: FilePathButtonProps) => {
    const handleClick = useCallback(() => {
      if (frame.filePath) {
        onFilePathClick?.(
          frame.filePath,
          frame.lineNumber ?? undefined,
          frame.columnNumber ?? undefined
        );
      }
    }, [frame, onFilePathClick]);

    return (
      <button
        className={cn(
          "underline decoration-dotted hover:text-primary",
          onFilePathClick && "cursor-pointer"
        )}
        disabled={!onFilePathClick}
        onClick={handleClick}
        type="button"
      >
        {frame.filePath}
        {frame.lineNumber !== null && `:${frame.lineNumber}`}
        {frame.columnNumber !== null && `:${frame.columnNumber}`}
      </button>
    );
  }
);

FilePathButton.displayName = "FilePathButton";

export const StackTraceFrames = memo(
  ({
    className,
    showInternalFrames = true,
    ...props
  }: StackTraceFramesProps) => {
    const { trace, onFilePathClick } = useStackTrace();

    const framesToShow = showInternalFrames
      ? trace.frames
      : trace.frames.filter((f) => !f.isInternal);

    return (
      <div className={cn("space-y-1 p-3", className)} {...props}>
        {framesToShow.map((frame) => (
          <div
            className={cn(
              "text-xs",
              frame.isInternal
                ? "text-muted-foreground/50"
                : "text-foreground/90"
            )}
            key={frame.raw}
          >
            <span className="text-muted-foreground">at </span>
            {frame.functionName && (
              <span className={frame.isInternal ? "" : "text-foreground"}>
                {frame.functionName}{" "}
              </span>
            )}
            {frame.filePath && (
              <>
                <span className="text-muted-foreground">(</span>
                <FilePathButton
                  frame={frame}
                  onFilePathClick={onFilePathClick}
                />
                <span className="text-muted-foreground">)</span>
              </>
            )}
            {!(frame.filePath || frame.functionName) && (
              <span>{frame.raw.replace(AT_PREFIX_REGEX, "")}</span>
            )}
          </div>
        ))}
        {framesToShow.length === 0 && (
          <div className="text-muted-foreground text-xs">No stack frames</div>
        )}
      </div>
    );
  }
);

StackTrace.displayName = "StackTrace";
StackTraceHeader.displayName = "StackTraceHeader";
StackTraceError.displayName = "StackTraceError";
StackTraceErrorType.displayName = "StackTraceErrorType";
StackTraceErrorMessage.displayName = "StackTraceErrorMessage";
StackTraceActions.displayName = "StackTraceActions";
StackTraceCopyButton.displayName = "StackTraceCopyButton";
StackTraceExpandButton.displayName = "StackTraceExpandButton";
StackTraceContent.displayName = "StackTraceContent";
StackTraceFrames.displayName = "StackTraceFrames";
