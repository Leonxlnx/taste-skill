"use client";

import * as React from "react";

import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "./lib/utils";
import * as DateTimeFieldPrimitive from "./date-time-field-primitive";

function DateTimeField({
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Root>) {
  return (
    <DateTimeFieldPrimitive.Root
      data-slot="date-time-field"
      render={<InputGroup className={cn("px-2", className)} />}
      {...props}
    />
  );
}

function DateTimeFieldSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Separator>) {
  return (
    <DateTimeFieldPrimitive.Separator
      data-slot="date-time-field-separator"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

const dateTimeFieldInputStyle =
  "focus:bg-primary dark:focus:bg-primary focus:text-primary-foreground focus:placeholder:text-primary-foreground box-content h-fit flex-initial rounded-sm px-0.5 py-0.5 tabular-nums";

function DateTimeFieldYears({
  placeholder = "yyyy",
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Years>) {
  return (
    <DateTimeFieldPrimitive.Years
      data-slot="date-time-field-years"
      placeholder={placeholder}
      render={
        <InputGroupInput
          className={cn(
            dateTimeFieldInputStyle,
            "max-w-[calc(4ch_+_0.5rem)]",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

function DateTimeFieldMonths({
  placeholder = "mm",
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Months>) {
  return (
    <DateTimeFieldPrimitive.Months
      data-slot="date-time-field-months"
      placeholder={placeholder}
      render={
        <InputGroupInput
          className={cn(
            dateTimeFieldInputStyle,
            "max-w-[calc(2ch_+_0.5rem)]",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

function DateTimeFieldDays({
  placeholder = "dd",
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Days>) {
  return (
    <DateTimeFieldPrimitive.Days
      data-slot="date-time-field-days"
      placeholder={placeholder}
      render={
        <InputGroupInput
          className={cn(
            dateTimeFieldInputStyle,
            "max-w-[calc(2ch_+_0.5rem)]",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

function DateTimeFieldHours({
  placeholder = "--",
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Hours>) {
  return (
    <DateTimeFieldPrimitive.Hours
      data-slot="date-time-field-hours"
      placeholder={placeholder}
      render={
        <InputGroupInput
          className={cn(
            dateTimeFieldInputStyle,
            "max-w-[calc(2ch_+_0.5rem)]",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

function DateTimeFieldMinutes({
  placeholder = "--",
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Minutes>) {
  return (
    <DateTimeFieldPrimitive.Minutes
      data-slot="date-time-field-minutes"
      placeholder={placeholder}
      render={
        <InputGroupInput
          className={cn(
            dateTimeFieldInputStyle,
            "max-w-[calc(2ch_+_0.5rem)]",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

function DateTimeFieldSeconds({
  placeholder = "--",
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.Seconds>) {
  return (
    <DateTimeFieldPrimitive.Seconds
      data-slot="date-time-field-seconds"
      placeholder={placeholder}
      render={
        <InputGroupInput
          className={cn(
            dateTimeFieldInputStyle,
            "max-w-[calc(2ch_+_0.5rem)]",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

function DateTimeFieldAmPm({
  placeholder = "--",
  className,
  ...props
}: React.ComponentProps<typeof DateTimeFieldPrimitive.AmPm>) {
  return (
    <DateTimeFieldPrimitive.AmPm
      data-slot="date-time-field-am-pm"
      placeholder={placeholder}
      render={
        <InputGroupInput
          className={cn(
            dateTimeFieldInputStyle,
            "max-w-[calc(2ch_+_0.5rem)] text-center",
            className,
          )}
        />
      }
      {...props}
    />
  );
}

export {
  DateTimeField,
  DateTimeFieldSeparator,
  DateTimeFieldYears,
  DateTimeFieldMonths,
  DateTimeFieldDays,
  DateTimeFieldHours,
  DateTimeFieldMinutes,
  DateTimeFieldSeconds,
  DateTimeFieldAmPm,
};
