"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface EnvironmentVariablesContextType {
  showValues: boolean;
  setShowValues: (show: boolean) => void;
}

// Default noop for context default value
// oxlint-disable-next-line eslint(no-empty-function)
const noop = () => {};

const EnvironmentVariablesContext =
  createContext<EnvironmentVariablesContextType>({
    setShowValues: noop,
    showValues: false,
  });

export type EnvironmentVariablesProps = HTMLAttributes<HTMLDivElement> & {
  showValues?: boolean;
  defaultShowValues?: boolean;
  onShowValuesChange?: (show: boolean) => void;
};

export const EnvironmentVariables = ({
  showValues: controlledShowValues,
  defaultShowValues = false,
  onShowValuesChange,
  className,
  children,
  ...props
}: EnvironmentVariablesProps) => {
  const [internalShowValues, setInternalShowValues] =
    useState(defaultShowValues);
  const showValues = controlledShowValues ?? internalShowValues;

  const setShowValues = useCallback(
    (show: boolean) => {
      setInternalShowValues(show);
      onShowValuesChange?.(show);
    },
    [onShowValuesChange]
  );

  const contextValue = useMemo(
    () => ({ setShowValues, showValues }),
    [setShowValues, showValues]
  );

  return (
    <EnvironmentVariablesContext.Provider value={contextValue}>
      <div
        className={cn("rounded-lg border bg-background", className)}
        {...props}
      >
        {children}
      </div>
    </EnvironmentVariablesContext.Provider>
  );
};

export type EnvironmentVariablesHeaderProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariablesHeader = ({
  className,
  children,
  ...props
}: EnvironmentVariablesHeaderProps) => (
  <div
    className={cn(
      "flex items-center justify-between border-b px-4 py-3",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type EnvironmentVariablesTitleProps = HTMLAttributes<HTMLHeadingElement>;

export const EnvironmentVariablesTitle = ({
  className,
  children,
  ...props
}: EnvironmentVariablesTitleProps) => (
  <h3 className={cn("font-medium text-sm", className)} {...props}>
    {children ?? "Environment Variables"}
  </h3>
);

export type EnvironmentVariablesToggleProps = ComponentProps<typeof Switch>;

export const EnvironmentVariablesToggle = ({
  className,
  ...props
}: EnvironmentVariablesToggleProps) => {
  const { showValues, setShowValues } = useContext(EnvironmentVariablesContext);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-muted-foreground text-xs">
        {showValues ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
      </span>
      <Switch
        aria-label="Toggle value visibility"
        checked={showValues}
        onCheckedChange={setShowValues}
        {...props}
      />
    </div>
  );
};

export type EnvironmentVariablesContentProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariablesContent = ({
  className,
  children,
  ...props
}: EnvironmentVariablesContentProps) => (
  <div className={cn("divide-y", className)} {...props}>
    {children}
  </div>
);

interface EnvironmentVariableContextType {
  name: string;
  value: string;
}

const EnvironmentVariableContext =
  createContext<EnvironmentVariableContextType>({
    name: "",
    value: "",
  });

export type EnvironmentVariableGroupProps = HTMLAttributes<HTMLDivElement>;

export const EnvironmentVariableGroup = ({
  className,
  children,
  ...props
}: EnvironmentVariableGroupProps) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

export type EnvironmentVariableNameProps = HTMLAttributes<HTMLSpanElement>;

export const EnvironmentVariableName = ({
  className,
  children,
  ...props
}: EnvironmentVariableNameProps) => {
  const { name } = useContext(EnvironmentVariableContext);

  return (
    <span className={cn("font-mono text-sm", className)} {...props}>
      {children ?? name}
    </span>
  );
};

export type EnvironmentVariableValueProps = HTMLAttributes<HTMLSpanElement>;

export const EnvironmentVariableValue = ({
  className,
  children,
  ...props
}: EnvironmentVariableValueProps) => {
  const { value } = useContext(EnvironmentVariableContext);
  const { showValues } = useContext(EnvironmentVariablesContext);

  const displayValue = showValues
    ? value
    : "•".repeat(Math.min(value.length, 20));

  return (
    <span
      className={cn(
        "font-mono text-muted-foreground text-sm",
        !showValues && "select-none",
        className
      )}
      {...props}
    >
      {children ?? displayValue}
    </span>
  );
};

export type EnvironmentVariableProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  value: string;
};

export const EnvironmentVariable = ({
  name,
  value,
  className,
  children,
  ...props
}: EnvironmentVariableProps) => {
  const envVarContextValue = useMemo(() => ({ name, value }), [name, value]);

  return (
    <EnvironmentVariableContext.Provider value={envVarContextValue}>
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-4 py-3",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <div className="flex items-center gap-2">
              <EnvironmentVariableName />
            </div>
            <EnvironmentVariableValue />
          </>
        )}
      </div>
    </EnvironmentVariableContext.Provider>
  );
};

export type EnvironmentVariableCopyButtonProps = ComponentProps<
  typeof Button
> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
  copyFormat?: "name" | "value" | "export";
};

export const EnvironmentVariableCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  copyFormat = "value",
  children,
  className,
  ...props
}: EnvironmentVariableCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);
  const { name, value } = useContext(EnvironmentVariableContext);

  const getTextToCopy = useCallback((): string => {
    const formatMap = {
      export: () => `export ${name}="${value}"`,
      name: () => name,
      value: () => value,
    };
    return formatMap[copyFormat]();
  }, [name, value, copyFormat]);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(getTextToCopy());
      setIsCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [getTextToCopy, onCopy, onError, timeout]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("size-6 shrink-0", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={12} />}
    </Button>
  );
};

export type EnvironmentVariableRequiredProps = ComponentProps<typeof Badge>;

export const EnvironmentVariableRequired = ({
  className,
  children,
  ...props
}: EnvironmentVariableRequiredProps) => (
  <Badge className={cn("text-xs", className)} variant="secondary" {...props}>
    {children ?? "Required"}
  </Badge>
);
