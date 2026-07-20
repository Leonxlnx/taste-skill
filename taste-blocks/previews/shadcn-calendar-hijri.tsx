"use client"

"use client"

import * as React from "react"

import { HijriCalendar } from "@/registry/sources/shadcn-ui/components/shadcn-calendar-hijri/calendar-hijri"

export default function ShadcnCalendarHijriPreview() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12),
  )

  return (
    <HijriCalendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={setDate}
      className="rounded-lg border"
    />
  )
}
