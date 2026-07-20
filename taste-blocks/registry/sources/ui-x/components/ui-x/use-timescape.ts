import { useControlled } from "@base-ui/utils/useControlled";
import { useStableCallback } from "@base-ui/utils/useStableCallback";
import * as React from "react";
import { DateRange } from "react-day-picker";
import {
  Options,
  useTimescape as useReactTimescape,
  useTimescapeRange as useReactTimescapeRange,
} from "timescape/react";

export type TimescapeOptions = Omit<Options, "date" | "onChangeDate">;

export interface UseTimescapeOptions extends TimescapeOptions {
  value?: Date | null;
  defaultValue?: Date;
  onValueChange?: (value: Date | null) => void;
}

export function useTimescape({
  value: valueProp,
  defaultValue,
  onValueChange,
  digits,
  hour12,
  maxDate,
  minDate,
  snapToStep,
  wheelControl,
  wrapAround,
}: UseTimescapeOptions) {
  const [value, setValueUnwrapped] = useControlled({
    controlled: valueProp,
    default: defaultValue ?? null,
    name: "useTimescape",
    state: "value",
  });

  const setValue = useStableCallback((nextValue: Date | null) => {
    setValueUnwrapped(nextValue);
    onValueChange?.(nextValue);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { update, _manager, ...timescape } = useReactTimescape({
    date: !value ? undefined : value, // This is the initial value.
    onChangeDate: (date) => setValue(date ?? null),
    digits,
    hour12,
    maxDate,
    minDate,
    snapToStep,
    wheelControl,
    wrapAround,
    // Partial input does not work with reactive value at the moment.
    // For more information, see https://github.com/dan-lee/timescape/issues/51.
    disallowPartial: true,
  });

  React.useEffect(() => {
    update((prevOptions) => ({
      ...prevOptions,
      date: !value ? undefined : value,
    }));
  }, [value, update]);

  React.useEffect(() => {
    update((prevOptions) => ({ ...prevOptions, digits }));
  }, [digits, update]);

  React.useEffect(() => {
    update((prevOptions) => ({ ...prevOptions, hour12 }));
  }, [hour12, update]);

  React.useEffect(() => {
    update((prevOptions) => ({ ...prevOptions, maxDate }));
  }, [maxDate, update]);

  React.useEffect(() => {
    update((prevOptions) => ({ ...prevOptions, minDate }));
  }, [minDate, update]);

  React.useEffect(() => {
    update((prevOptions) => ({ ...prevOptions, snapToStep }));
  }, [snapToStep, update]);

  React.useEffect(() => {
    update((prevOptions) => ({ ...prevOptions, wheelControl }));
  }, [wheelControl, update]);

  React.useEffect(() => {
    update((prevOptions) => ({ ...prevOptions, wrapAround }));
  }, [wrapAround, update]);

  return timescape;
}

export interface UseTimescapeRangeOptions extends TimescapeOptions {
  value?: DateRange | null;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange | null) => void;
  from?: TimescapeOptions;
  to?: TimescapeOptions;
}

export const useTimescapeRange = ({
  value: valueProp,
  defaultValue,
  onValueChange,
  digits,
  hour12,
  maxDate,
  minDate,
  snapToStep,
  wheelControl,
  wrapAround,
  from: fromOptions = {},
  to: toOptions = {},
}: UseTimescapeRangeOptions) => {
  const [value, setValueUnwrapped] = useControlled({
    controlled: valueProp,
    default: defaultValue ?? null,
    name: "useTimescapeRange",
    state: "value",
  });

  const setValue = useStableCallback(
    (action: React.SetStateAction<DateRange | null>) => {
      const nextValue = typeof action === "function" ? action(value) : action;
      setValueUnwrapped(nextValue);
      onValueChange?.(nextValue);
    },
  );

  const { from, to, ...timescape } = useReactTimescapeRange({
    from: {
      date: !value?.from ? undefined : value.from, // This is the initial value.
      onChangeDate: (from) =>
        setValue((prevValue) => ({ from, to: prevValue?.to })),
      digits,
      hour12,
      maxDate,
      minDate,
      snapToStep,
      wheelControl,
      wrapAround,
      // Partial input does not work with reactive value at the moment.
      // For more information, see https://github.com/dan-lee/timescape/issues/51.
      disallowPartial: true,
      ...fromOptions,
    },
    to: {
      date: !value?.to ? undefined : value.to, // This is the initial value.
      onChangeDate: (to) =>
        setValue((prevValue) => ({ from: prevValue?.from, to })),
      digits,
      hour12,
      maxDate,
      minDate,
      snapToStep,
      wheelControl,
      wrapAround,
      // Partial input does not work with reactive value at the moment.
      // For more information, see https://github.com/dan-lee/timescape/issues/51.
      disallowPartial: true,
      ...toOptions,
    },
  });

  // ----------------------------------------------------------------------------
  // Sync `from`
  // ----------------------------------------------------------------------------

  const { update: fromUpdate, ...fromTimescape } = from;

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      digits: fromOptions.digits ?? digits,
    }));
  }, [digits, fromOptions.digits, fromUpdate]);

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      hour12: fromOptions.hour12 ?? hour12,
    }));
  }, [hour12, fromOptions.hour12, fromUpdate]);

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      maxDate: fromOptions.maxDate ?? maxDate,
    }));
  }, [maxDate, fromOptions.maxDate, fromUpdate]);

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      minDate: fromOptions.minDate ?? minDate,
    }));
  }, [minDate, fromOptions.minDate, fromUpdate]);

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      snapToStep: fromOptions.snapToStep ?? snapToStep,
    }));
  }, [snapToStep, fromOptions.snapToStep, fromUpdate]);

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      wheelControl: fromOptions.wheelControl ?? wheelControl,
    }));
  }, [wheelControl, fromOptions.wheelControl, fromUpdate]);

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      wrapAround: fromOptions.wrapAround ?? wrapAround,
    }));
  }, [wrapAround, fromOptions.wrapAround, fromUpdate]);

  // ----------------------------------------------------------------------------
  // Sync `to`
  // ----------------------------------------------------------------------------

  const { update: toUpdate, ...toTimescape } = to;

  React.useEffect(() => {
    toUpdate((prevOptions) => ({
      ...prevOptions,
      digits: toOptions.digits ?? digits,
    }));
  }, [digits, toOptions.digits, toUpdate]);

  React.useEffect(() => {
    toUpdate((prevOptions) => ({
      ...prevOptions,
      hour12: toOptions.hour12 ?? hour12,
    }));
  }, [hour12, toOptions.hour12, toUpdate]);

  React.useEffect(() => {
    toUpdate((prevOptions) => ({
      ...prevOptions,
      maxDate: toOptions.maxDate ?? maxDate,
    }));
  }, [maxDate, toOptions.maxDate, toUpdate]);

  React.useEffect(() => {
    toUpdate((prevOptions) => ({
      ...prevOptions,
      minDate: toOptions.minDate ?? minDate,
    }));
  }, [minDate, toOptions.minDate, toUpdate]);

  React.useEffect(() => {
    toUpdate((prevOptions) => ({
      ...prevOptions,
      snapToStep: toOptions.snapToStep ?? snapToStep,
    }));
  }, [snapToStep, toOptions.snapToStep, toUpdate]);

  React.useEffect(() => {
    toUpdate((prevOptions) => ({
      ...prevOptions,
      wheelControl: toOptions.wheelControl ?? wheelControl,
    }));
  }, [wheelControl, toOptions.wheelControl, toUpdate]);

  React.useEffect(() => {
    toUpdate((prevOptions) => ({
      ...prevOptions,
      wrapAround: toOptions.wrapAround ?? wrapAround,
    }));
  }, [wrapAround, toOptions.wrapAround, toUpdate]);

  // ----------------------------------------------------------------------------
  // Sync `value`
  // ----------------------------------------------------------------------------

  React.useEffect(() => {
    fromUpdate((prevOptions) => ({
      ...prevOptions,
      date: !value?.from ? undefined : value.from,
    }));
    toUpdate((prevOptions) => ({
      ...prevOptions,
      date: !value?.to ? undefined : value.to,
    }));
  }, [value, fromUpdate, toUpdate]);

  return {
    ...timescape,
    from: fromTimescape,
    to: toTimescape,
  };
};
