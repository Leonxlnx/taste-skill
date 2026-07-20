"use client";

import { useRender } from "@base-ui/react/use-render";
import * as React from "react";

import {
  UseTimescapeRangeOptions,
  useTimescapeRange,
} from "./use-timescape";

export type DateTimeRangeFieldContextProps = {
  disabled?: boolean;
} & ReturnType<typeof useTimescapeRange>;

const DateTimeRangeFieldContext =
  React.createContext<DateTimeRangeFieldContextProps>({
    from: {
      getInputProps: () => ({ ref: () => null }),
      options: {},
    },
    to: {
      getInputProps: () => ({ ref: () => null }),
      options: {},
    },
    getRootProps: () => ({ ref: () => null }),
    disabled: false,
  });

export function useDateTimeRangeField() {
  const context = React.useContext(DateTimeRangeFieldContext);
  if (!context) {
    throw new Error(
      "useDateTimeRangeField must be used within a <DateTimeRangeField />.",
    );
  }

  return context;
}

export interface DateTimeRangeFieldProps
  extends
    UseTimescapeRangeOptions,
    Omit<useRender.ComponentProps<"div">, "value" | "defaultValue"> {
  disabled?: boolean;
}

export function DateTimeRangeField({
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
  from,
  to,
  render,
  ...props
}: DateTimeRangeFieldProps) {
  const timescape = useTimescapeRange({
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
    from,
    to,
  });

  const { ref: rootRef, ...rootProps } = timescape.getRootProps();

  const element = useRender({
    render,
    ref: (node: HTMLDivElement | null) => {
      rootRef(node);
    },
    defaultTagName: "div",
    props: {
      "data-slot": "date-time-range-field",
      "data-disabled": disabled,
      ...rootProps,
      ...props,
    },
  });

  return (
    <DateTimeRangeFieldContext.Provider value={{ ...timescape, disabled }}>
      {element}
    </DateTimeRangeFieldContext.Provider>
  );
}

export function DateTimeRangeFieldSeparator({
  render,
  ...props
}: useRender.ComponentProps<"span">) {
  const { disabled } = useDateTimeRangeField();

  return useRender({
    render,
    defaultTagName: "span",
    props: {
      "data-slot": "date-time-range-field-separator",
      "aria-hidden": "true",
      "data-disabled": disabled,
      ...props,
    },
  });
}

const DateTimeRangeFieldFromContext = React.createContext(false);

export function DateTimeRangeFieldFrom({
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const element = useRender({
    render,
    defaultTagName: "div",
    props: {
      "data-slot": "date-time-range-field-from",
      ...props,
    },
  });

  return (
    <DateTimeRangeFieldFromContext.Provider value={true}>
      {element}
    </DateTimeRangeFieldFromContext.Provider>
  );
}

const DateTimeRangeFieldToContext = React.createContext(false);

export function DateTimeRangeFieldTo({
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  const element = useRender({
    render,
    defaultTagName: "div",
    props: {
      "data-slot": "date-time-range-field-to",
      ...props,
    },
  });

  return (
    <DateTimeRangeFieldToContext.Provider value={true}>
      {element}
    </DateTimeRangeFieldToContext.Provider>
  );
}

function useDateTimeFieldSegment() {
  const isFrom = React.useContext(DateTimeRangeFieldFromContext);
  const isTo = React.useContext(DateTimeRangeFieldToContext);
  const { disabled, from, to } = useDateTimeRangeField();

  if (!isFrom && !isTo) {
    throw new Error(
      "useDateTimeFieldSegment should be used within <DateTimeRangeFieldFrom /> or <DateTimeRangeFieldTo /> components",
    );
  }

  return {
    ...(isFrom ? from : to),
    disabled,
  };
}

export function DateTimeRangeFieldYears({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeFieldSegment();
  const { ref: inputRef, ...inputProps } = getInputProps("years");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-range-field-years",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeRangeFieldMonths({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeFieldSegment();
  const { ref: inputRef, ...inputProps } = getInputProps("months");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-range-field-months",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeRangeFieldDays({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeFieldSegment();
  const { ref: inputRef, ...inputProps } = getInputProps("days");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-range-field-days",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeRangeFieldHours({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeFieldSegment();
  const { ref: inputRef, ...inputProps } = getInputProps("hours");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-range-field-hours",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeRangeFieldMinutes({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeFieldSegment();
  const { ref: inputRef, ...inputProps } = getInputProps("minutes");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-range-field-minutes",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeRangeFieldSeconds({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, disabled } = useDateTimeFieldSegment();
  const { ref: inputRef, ...inputProps } = getInputProps("seconds");

  return useRender({
    render,
    ref: inputRef,
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-range-field-seconds",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export function DateTimeRangeFieldAmPm({
  disabled: disabledProp,
  render,
  ...props
}: useRender.ComponentProps<"input">) {
  const { getInputProps, options, disabled } = useDateTimeFieldSegment();
  const { ref: inputRef, ...inputProps } = getInputProps("am/pm");

  return useRender({
    render,
    ref: inputRef,
    enabled: Boolean(options?.hour12),
    defaultTagName: "input",
    props: {
      "data-slot": "date-time-range-field-am-pm",
      ...inputProps,
      disabled: disabled || disabledProp,
      ...props,
    },
  });
}

export {
  DateTimeRangeField as Root,
  DateTimeRangeFieldFrom as From,
  DateTimeRangeFieldTo as To,
  DateTimeRangeFieldSeparator as Separator,
  DateTimeRangeFieldYears as Years,
  DateTimeRangeFieldMonths as Months,
  DateTimeRangeFieldDays as Days,
  DateTimeRangeFieldHours as Hours,
  DateTimeRangeFieldMinutes as Minutes,
  DateTimeRangeFieldSeconds as Seconds,
  DateTimeRangeFieldAmPm as AmPm,
};
