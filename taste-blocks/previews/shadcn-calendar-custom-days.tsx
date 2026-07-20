"use client"

"use client"

import { CalendarCustomDays } from "@/registry/sources/shadcn-ui/components/shadcn-calendar-custom-days/calendar-custom-days"

export default function ShadcnCalendarCustomDaysPreview() {
  return (
    <CalendarCustomDays
      renderDayMeta={(date) =>
        date.getDay() === 0 || date.getDay() === 6 ? "$120" : "$100"
      }
    />
  )
}
