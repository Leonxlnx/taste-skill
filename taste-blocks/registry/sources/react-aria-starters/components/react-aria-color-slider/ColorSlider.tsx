'use client';
import {
  ColorSlider as AriaColorSlider,
  type ColorSliderProps as AriaColorSliderProps,
  SliderOutput,
  SliderTrack
} from 'react-aria-components/ColorSlider';
import {Label} from './Form';
import {ColorThumb} from './ColorThumb';
import './ColorSlider.css';

export interface ColorSliderProps extends AriaColorSliderProps {
  label?: string;
}

export function ColorSlider({label, ...props}: ColorSliderProps) {
  return (
    <AriaColorSlider {...props}>
      <Label>{label}</Label>
      <SliderOutput />
      <SliderTrack
        style={({defaultStyle}) => ({
          background: `${defaultStyle.background},
            repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`
        })}>
        <ColorThumb />
      </SliderTrack>
    </AriaColorSlider>
  );
}
