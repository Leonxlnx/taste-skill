'use client';

import type { FC } from 'react';

import { Handle } from './components/handle';
import { HandleRoot } from './components/handle-root';
import { Item } from './components/item';
import { Provider } from './components/provider';
import { Root } from './components/root';
import { useReactCompareSlider } from './hooks';
import type { ReactCompareSliderDetailedProps } from './types';

export const ReactCompareSlider: FC<ReactCompareSliderDetailedProps> = ({
  boundsPadding,
  browsingContext,
  changePositionOnHover,
  clip,
  defaultPosition,
  disabled,
  handle,
  itemOne,
  itemTwo,
  keyboardIncrement,
  onPositionChange,
  onlyHandleDraggable,
  portrait,
  transition,
  ...props
}) => {
  const contextProps = useReactCompareSlider({
    boundsPadding,
    browsingContext,
    changePositionOnHover,
    clip,
    defaultPosition,
    disabled,
    keyboardIncrement,
    onPositionChange,
    onlyHandleDraggable,
    portrait,
    transition,
  });

  return (
    <Provider {...contextProps}>
      <Root {...props}>
        <Item item="itemOne">{itemOne}</Item>
        <Item item="itemTwo">{itemTwo}</Item>
        <HandleRoot>{handle || <Handle />}</HandleRoot>
      </Root>
    </Provider>
  );
};
