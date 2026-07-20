'use client';

import type { ComponentProps, CSSProperties, FC } from 'react';

import { useReactCompareSliderContext } from './provider';
import {
  ReactCompareSliderClip,
  type ReactCompareSliderClipValue,
  ReactCompareSliderCssVars,
} from '../consts';
import type { ReactCompareSliderProps } from '../types';

type GetClipPathProps = Pick<ReactCompareSliderProps, 'portrait'> & {
  itemClip?: Extract<ReactCompareSliderClipValue, 'itemOne' | 'itemTwo'>;
};

const getClipPath = ({ itemClip, portrait }: GetClipPathProps): CSSProperties['clipPath'] => {
  if (itemClip === ReactCompareSliderClip.itemOne) {
    return portrait
      ? `inset(0px 0px calc(100% - var(${ReactCompareSliderCssVars.currentPosition})) 0px)`
      : `inset(0px calc(100% - var(${ReactCompareSliderCssVars.currentPosition})) 0px 0px)`;
  }

  if (itemClip === ReactCompareSliderClip.itemTwo) {
    return portrait
      ? `inset(var(${ReactCompareSliderCssVars.currentPosition}) 0px 0px 0px)`
      : `inset(0px 0px 0px var(${ReactCompareSliderCssVars.currentPosition}))`;
  }

  return 'none';
};

export type ItemsProps = ComponentProps<'div'> & {
  item?: Extract<ReactCompareSliderClipValue, 'itemOne' | 'itemTwo'>;
};

/**
 * Container for `itemOne` and `itemTwo`.
 */
export const Item: FC<ItemsProps> = ({ item, style, ...props }) => {
  const { clip, portrait } = useReactCompareSliderContext();

  const shouldClip = clip === ReactCompareSliderClip.all || clip === item;
  const itemClip = shouldClip ? item : undefined;

  const appliedStyle: CSSProperties = {
    KhtmlUserSelect: 'none',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    gridArea: '1 / 1',
    maxWidth: '100%',
    overflow: 'hidden',
    clipPath: getClipPath({ itemClip, portrait }),
    boxSizing: 'border-box',
    transform: 'translateZ(0)',
    userSelect: 'none',
    zIndex: item === ReactCompareSliderClip.itemOne ? 1 : undefined,
    willChange: 'clip-path',
    ...style,
  };

  return <div data-rcs="item" data-rcs-item={item} {...props} style={appliedStyle} />;
};
