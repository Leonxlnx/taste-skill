"use client";

import * as React from "react";

import { InputGroup } from "@/components/ui/input-group";
import { cn } from "./lib/utils";
import {
  DateTimeFieldAmPm,
  DateTimeFieldDays,
  DateTimeFieldHours,
  DateTimeFieldMinutes,
  DateTimeFieldMonths,
  DateTimeFieldSeconds,
  DateTimeFieldSeparator,
  DateTimeFieldYears,
} from "./date-time-field";
import * as DateTimeRangeFieldPrimitive from "./date-time-range-field-primitive";

function DateTimeRangeField({
  className,
  ...props
}: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.Root>) {
  return (
    <DateTimeRangeFieldPrimitive.Root
      data-slot="date-time-range-field"
      render={<InputGroup className={cn("gap-1.5 px-2", className)} />}
      {...props}
    />
  );
}

function DateTimeRangeFieldFrom({
  className,
  ...props
}: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.From>) {
  return (
    <DateTimeRangeFieldPrimitive.From
      data-slot="date-time-range-field-from"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function DateTimeRangeFieldTo({
  className,
  ...props
}: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.To>) {
  return (
    <DateTimeRangeFieldPrimitive.To
      data-slot="date-time-range-field-to"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function DateTimeRangeFieldSeparator(
  props: React.ComponentProps<typeof DateTimeFieldSeparator>,
) {
  return (
    <DateTimeFieldSeparator
      data-slot="date-time-range-field-separator"
      {...props}
    />
  );
}

function DateTimeRangeFieldYears(
  props: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.Years>,
) {
  return (
    <DateTimeRangeFieldPrimitive.Years
      data-slot="date-time-range-field-years"
      render={<DateTimeFieldYears />}
      {...props}
    />
  );
}

function DateTimeRangeFieldMonths(
  props: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.Months>,
) {
  return (
    <DateTimeRangeFieldPrimitive.Months
      data-slot="date-time-range-field-months"
      render={<DateTimeFieldMonths />}
      {...props}
    />
  );
}

function DateTimeRangeFieldDays(
  props: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.Days>,
) {
  return (
    <DateTimeRangeFieldPrimitive.Days
      data-slot="date-time-range-field-days"
      render={<DateTimeFieldDays />}
      {...props}
    />
  );
}

function DateTimeRangeFieldHours(
  props: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.Hours>,
) {
  return (
    <DateTimeRangeFieldPrimitive.Hours
      data-slot="date-time-range-field-hours"
      render={<DateTimeFieldHours />}
      {...props}
    />
  );
}

function DateTimeRangeFieldMinutes(
  props: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.Minutes>,
) {
  return (
    <DateTimeRangeFieldPrimitive.Minutes
      data-slot="date-time-range-field-minutes"
      render={<DateTimeFieldMinutes />}
      {...props}
    />
  );
}

function DateTimeRangeFieldSeconds(
  props: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.Seconds>,
) {
  return (
    <DateTimeRangeFieldPrimitive.Seconds
      data-slot="date-time-range-field-seconds"
      render={<DateTimeFieldSeconds />}
      {...props}
    />
  );
}

function DateTimeRangeFieldAmPm(
  props: React.ComponentProps<typeof DateTimeRangeFieldPrimitive.AmPm>,
) {
  return (
    <DateTimeRangeFieldPrimitive.AmPm
      data-slot="date-time-range-field-am-pm"
      render={<DateTimeFieldAmPm />}
      {...props}
    />
  );
}

export {
  DateTimeRangeField,
  DateTimeRangeFieldFrom,
  DateTimeRangeFieldTo,
  DateTimeRangeFieldSeparator,
  DateTimeRangeFieldYears,
  DateTimeRangeFieldMonths,
  DateTimeRangeFieldDays,
  DateTimeRangeFieldHours,
  DateTimeRangeFieldMinutes,
  DateTimeRangeFieldSeconds,
  DateTimeRangeFieldAmPm,
};
