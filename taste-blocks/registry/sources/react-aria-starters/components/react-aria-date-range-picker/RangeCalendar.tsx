'use client';
import {
  CalendarCell as AriaCalendarCell,
  RangeCalendar as AriaRangeCalendar,
  CalendarHeading,
  Text,
  type DateValue,
  type RangeCalendarProps as AriaRangeCalendarProps,
  type CalendarCellProps
} from 'react-aria-components/RangeCalendar';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Button} from './Button';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {CalendarGrid} from './Calendar';
import './RangeCalendar.css';

export interface RangeCalendarProps<T extends DateValue> extends AriaRangeCalendarProps<T> {
  errorMessage?: string;
}

export function RangeCalendar<T extends DateValue>({
  errorMessage,
  ...props
}: RangeCalendarProps<T>) {
  let months = props.visibleDuration?.months || 1;
  return (
    <AriaRangeCalendar {...props}>
      <div className="months">
        {Array.from({length: months}, (_, i) => (
          <div key={i} className="month">
            <header>
              {i === 0 && (
                <Button slot="previous" variant="quiet">
                  <ChevronLeft />
                </Button>
              )}
              <CalendarHeading offset={{months: i}} />
              {i === months - 1 && (
                <Button slot="next" variant="quiet">
                  <ChevronRight />
                </Button>
              )}
            </header>
            <CalendarGrid offset={{months: i}}>{date => <CalendarCell date={date} />}</CalendarGrid>
          </div>
        ))}
      </div>
      {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
    </AriaRangeCalendar>
  );
}

export {CalendarGrid};
export function CalendarCell(props: CalendarCellProps) {
  return (
    <AriaCalendarCell {...props}>
      {composeRenderProps(
        props.children,
        (
          children,
          {defaultChildren, isHovered, isPressed, isSelectionStart, isSelectionEnd, isDisabled}
        ) => (
          <span
            className="button-base"
            data-variant="quiet"
            data-hovered={isHovered || undefined}
            data-pressed={isPressed || undefined}
            data-selected={isSelectionStart || isSelectionEnd || undefined}
            data-disabled={isDisabled || undefined}>
            {children || defaultChildren}
          </span>
        )
      )}
    </AriaCalendarCell>
  );
}
