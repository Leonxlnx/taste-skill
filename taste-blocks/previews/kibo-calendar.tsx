"use client"

"use client"

import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarDatePicker,
  CalendarHeader,
  CalendarItem,
  CalendarMonthPicker,
  CalendarProvider,
  CalendarYearPicker,
} from "@/registry/sources/kibo-ui/components/kibo-calendar"

const today = new Date()
const year = today.getFullYear()
const month = today.getMonth()
const statuses = {
  planned: { id: "planned", name: "Planned", color: "#64748b" },
  active: { id: "active", name: "In progress", color: "#f59e0b" },
  done: { id: "done", name: "Done", color: "#10b981" },
}
const features = [
  {
    id: "keyboard-pass",
    name: "Keyboard pass",
    startAt: new Date(year, month, 3),
    endAt: new Date(year, month, 8),
    status: statuses.done,
  },
  {
    id: "responsive-qa",
    name: "Responsive QA",
    startAt: new Date(year, month, 10),
    endAt: new Date(year, month, 17),
    status: statuses.active,
  },
  {
    id: "release-notes",
    name: "Release notes",
    startAt: new Date(year, month, 20),
    endAt: new Date(year, month, 24),
    status: statuses.planned,
  },
]

export default function KiboCalendarPreview() {
  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-xl border">
      <CalendarProvider>
        <CalendarDate>
          <CalendarDatePicker>
            <CalendarMonthPicker />
            <CalendarYearPicker end={year} start={year} />
          </CalendarDatePicker>
          <CalendarDatePagination />
        </CalendarDate>
        <CalendarHeader />
        <CalendarBody features={features}>
          {({ feature }) => <CalendarItem feature={feature} key={feature.id} />}
        </CalendarBody>
      </CalendarProvider>
    </div>
  )
}
