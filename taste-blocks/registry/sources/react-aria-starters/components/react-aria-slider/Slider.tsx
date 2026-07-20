'use client';
import {
  Slider as AriaSlider,
  SliderOutput,
  type SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack,
  SliderFill
} from 'react-aria-components/Slider';
import {Label} from './Form';
import './Slider.css';

export interface SliderProps<T> extends AriaSliderProps<T> {
  /** Label for the slider. */
  label?: string;
  /** Aria labels for each thumb. */
  thumbLabels?: string[];
  /**
   * The offset from which to start the fill.
   *
   * @default 0
   */
  fillOffset?: number;
}

export function Slider<T extends number | number[]>({
  label,
  thumbLabels,
  fillOffset,
  ...props
}: SliderProps<T>) {
  return (
    <AriaSlider {...props}>
      {label && <Label>{label}</Label>}
      <SliderOutput />
      <SliderTrack>
        {({state, isDisabled}) => (
          <>
            <div className="track inset" data-disabled={isDisabled || undefined}>
              <SliderFill offset={fillOffset} />
            </div>
            {state.values.map((_, i) => (
              <SliderThumb
                key={i}
                index={i}
                aria-label={thumbLabels?.[i]}
                className="react-aria-SliderThumb indicator"
              />
            ))}
          </>
        )}
      </SliderTrack>
    </AriaSlider>
  );
}
