"use client"

import * as React from "react"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"

import { Calendar, CalendarDayButton } from "../radix-nova/calendar"
import { Card, CardContent } from "../radix-nova/card"

export function CalendarCustomDays({
  defaultRange = {
    from: new Date(new Date().getFullYear(), 11, 8),
    to: addDays(new Date(new Date().getFullYear(), 11, 8), 10),
  },
  onRangeChange,
  renderDayMeta,
}: {
  defaultRange?: DateRange
  onRangeChange?: (range: DateRange | undefined) => void
  renderDayMeta: (date: Date) => React.ReactNode
}) {
  const [range, setRange] = React.useState<DateRange | undefined>({
    ...defaultRange,
  })

  return (
    <Card className="mx-auto w-fit p-0">
      <CardContent className="p-0">
        <Calendar
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          onSelect={(nextRange) => {
            setRange(nextRange)
            onRangeChange?.(nextRange)
          }}
          numberOfMonths={1}
          captionLayout="dropdown"
          className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
          formatters={{
            formatMonthDropdown: (date) => {
              return date.toLocaleString("default", { month: "long" })
            },
          }}
          components={{
            DayButton: ({ children, modifiers, day, ...props }) => {
              const meta = renderDayMeta(day.date)

              return (
                <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                  {children}
                  {!modifiers.outside && meta != null ? (
                    <span>{meta}</span>
                  ) : null}
                </CalendarDayButton>
              )
            },
          }}
        />
      </CardContent>
    </Card>
  )
}
