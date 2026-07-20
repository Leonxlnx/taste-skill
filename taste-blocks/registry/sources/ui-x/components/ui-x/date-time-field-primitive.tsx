"use client";

import { useRender } from "@base-ui/react/use-render";
import * as React from "react";

import {
  UseTimescapeOptions,
  useTimescape,
} from "./use-timescape";

export type DateTimeFieldContextProps = {
  disabled?: boolean;
} & ReturnType<typeof useTimescape>;

const DateTimeFieldContext = React.createContext<DateTimeFieldContextProps>({
  getInputProps: () => ({ ref: () => null }),
  getRootProps: () => ({ ref: () => null }),
  ampm: {
    value: undefined,
    set: () => {},
    toggle: () => {},
    getSelectProps: () => ({ value: undefined, onChange: () => {} }),
  },
  options: {},
  disabled: false,
});

export function useDateTimeField() {
  const context = React.useContext(DateTimeFieldContext);
  if (!context) {
    throw new Error(
      "useDateTimeField must be used within a <DateTimeField />.",
    );
  }

  return context;
}

export interface DateTimeFieldProps
  extends
    UseTimescapeOptions,
    Omit<useRender.ComponentProps<"div">, "value" | "defaultValue"> {
  disabled?: boolean;
}

export function DateTimeField({
  value,
  defaultValue,
  onValueChange,
  disabled,
  digits,
  hour12,
  maxDate,
  minDate,
  snapToStep,
  wheelControl,
  wrapAround,
  render,
  ...props
}: DateTimeFieldProps) {
  const timescape = useTimescape({
    value,
    defaultValue,
    onValueChange,
    digits,
    hour12,
    maxDate,
    minDate,
    snapToStep,
    wheelControl,
    wrapAround,
  });

  const { ref: rootRef, ...rootProps } = timescape.getRootProps();

  const element = useRender({
    render,
    ref: (node: HTMLDivElement | null) => {
      rootRef(node);
    },
    defaultTagName: "div",
    props: {
      "data-slot": "date-time-field",
      "data-disabled": disabled,
      ...rootProps,
      ...props,
    },
  });

  return (
    <DateTimeFieldContext.Provider value={{ ...timescape, disabled }}>
      {element}
    </DateTimeFieldContext.Provider>
  );
}

export function DateTimeFieldSeparator({
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  const { disabled } = useDateTimeField();

  return useRender({
    render,
    defaultTagName: "span",
    props: {
      "data-slot": "date-time-field-separator",
      "aria-hidden": "true",
      "data-disabled": disabled,
      ...props,
    },
  });
}

export function DateTimeFieldYears({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeField();
  const { ref: inputRef, ...inputProps } = getInputProps("years");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-field-years",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeFieldMonths({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeField();
  const { ref: inputRef, ...inputProps } = getInputProps("months");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-field-months",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeFieldDays({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeField();
  const { ref: inputRef, ...inputProps } = getInputProps("days");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-field-days",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeFieldHours({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeField();
  const { ref: inputRef, ...inputProps } = getInputProps("hours");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-field-hours",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeFieldMinutes({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeField();
  const { ref: inputRef, ...inputProps } = getInputProps("minutes");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-field-minutes",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeFieldSeconds({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeField();
  const { ref: inputRef, ...inputProps } = getInputProps("seconds");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-field-seconds",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeFieldAmPm({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled, options } = useDateTimeField();
  const { ref: inputRef, ...inputProps } = getInputProps("am/pm");

  return useRender({
    render,
    ref: inputRef,
    enabled: Boolean(options?.hour12),
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-field-am-pm",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export {
  DateTimeField as Root,
  DateTimeFieldSeparator as Separator,
  DateTimeFieldDays as Days,
  DateTimeFieldMonths as Months,
  DateTimeFieldYears as Years,
  DateTimeFieldHours as Hours,
  DateTimeFieldMinutes as Minutes,
  DateTimeFieldSeconds as Seconds,
  DateTimeFieldAmPm as AmPm,
};
