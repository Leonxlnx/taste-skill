"use client"

import {
  DateTimeRangeField,
  DateTimeRangeFieldAmPm,
  DateTimeRangeFieldDays,
  DateTimeRangeFieldFrom,
  DateTimeRangeFieldHours,
  DateTimeRangeFieldMinutes,
  DateTimeRangeFieldMonths,
  DateTimeRangeFieldSeparator,
  DateTimeRangeFieldTo,
  DateTimeRangeFieldYears,
} from "@/registry/sources/ui-x/components/ui-x/date-time-range-field"

function DateAndTime() {
  return (
    <>
      <DateTimeRangeFieldDays />
      <DateTimeRangeFieldSeparator>/</DateTimeRangeFieldSeparator>
      <DateTimeRangeFieldMonths />
      <DateTimeRangeFieldSeparator>/</DateTimeRangeFieldSeparator>
      <DateTimeRangeFieldYears />
      <DateTimeRangeFieldSeparator>·</DateTimeRangeFieldSeparator>
      <DateTimeRangeFieldHours />
      <DateTimeRangeFieldSeparator>:</DateTimeRangeFieldSeparator>
      <DateTimeRangeFieldMinutes />
      <DateTimeRangeFieldAmPm />
    </>
  )
}

export default function UiXDateTimeRangeFieldPreview() {
  return (
    <div className="flex min-h-64 items-center justify-center overflow-x-auto p-6">
      <DateTimeRangeField aria-label="Date and time range" hour12>
        <DateTimeRangeFieldFrom>
          <DateAndTime />
        </DateTimeRangeFieldFrom>
        <DateTimeRangeFieldSeparator>to</DateTimeRangeFieldSeparator>
        <DateTimeRangeFieldTo>
          <DateAndTime />
        </DateTimeRangeFieldTo>
      </DateTimeRangeField>
    </div>
  )
}
