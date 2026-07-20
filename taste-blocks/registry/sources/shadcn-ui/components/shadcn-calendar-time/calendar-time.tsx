"use client"

import * as React from "react"
import { Clock2Icon } from "lucide-react"

import { Calendar } from "../radix-nova/calendar"
import { Card, CardContent, CardFooter } from "../radix-nova/card"
import { Field, FieldGroup, FieldLabel } from "../radix-nova/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../radix-nova/input-group"

export function CalendarWithTime({
  defaultDate = new Date(new Date().getFullYear(), new Date().getMonth(), 12),
  defaultEndTime = "12:30:00",
  defaultStartTime = "10:30:00",
  endTimeName,
  onDateChange,
  startTimeName,
}: {
  defaultDate?: Date
  defaultEndTime?: string
  defaultStartTime?: string
  endTimeName?: string
  onDateChange?: (date: Date | undefined) => void
  startTimeName?: string
}) {
  const [date, setDate] = React.useState<Date | undefined>(defaultDate)
  const id = React.useId()
  const startTimeId = `${id}-start`
  const endTimeId = `${id}-end`

  return (
    <Card size="sm" className="mx-auto w-fit">
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(nextDate) => {
            setDate(nextDate)
            onDateChange?.(nextDate)
          }}
          className="p-0"
        />
      </CardContent>
      <CardFooter className="border-t bg-card">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={startTimeId}>Start Time</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id={startTimeId}
                name={startTimeName}
                type="time"
                step="1"
                defaultValue={defaultStartTime}
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor={endTimeId}>End Time</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id={endTimeId}
                name={endTimeName}
                type="time"
                step="1"
                defaultValue={defaultEndTime}
                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  )
}
