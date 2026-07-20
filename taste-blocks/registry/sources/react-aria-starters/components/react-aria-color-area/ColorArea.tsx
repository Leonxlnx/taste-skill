'use client';
import {ColorArea as AriaColorArea, type ColorAreaProps} from 'react-aria-components/ColorArea';
import {ColorThumb} from './ColorThumb';
import './ColorArea.css';

export function ColorArea(props: ColorAreaProps) {
  return (
    <AriaColorArea {...props}>
      <ColorThumb />
    </AriaColorArea>
  );
}
