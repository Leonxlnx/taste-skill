"use client"

import { CalendarWithTime } from "@/registry/sources/shadcn-ui/components/shadcn-calendar-time/calendar-time"

export default function ShadcnCalendarTimePreview() {
  return <CalendarWithTime startTimeName="start-time" endTimeName="end-time" />
}
