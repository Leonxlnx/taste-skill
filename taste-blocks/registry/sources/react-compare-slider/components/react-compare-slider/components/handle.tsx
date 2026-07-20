'use client';

import type { ComponentProps, CSSProperties, FC } from 'react';

import { useReactCompareSliderContext } from './provider';
import { ReactCompareSliderCssVars } from '../consts';

type ThisArrowProps = {
  /** Whether to flip the arrow direction. */
  flip?: boolean;
};

const ThisArrow: FC<ThisArrowProps> = ({ flip }) => {
  const style: CSSProperties = {
    width: '0.85rem',
    height: '0.85rem',
    clipPath: 'polygon(100% 0%, 100% 100%, 30% 50%)',
    rotate: flip ? '180deg' : '0deg',
    // We use `outline` instead of `border` to ensure that all line colours match in high contrast mode.
    outline: `0.5rem solid var(${ReactCompareSliderCssVars.handleColor})`,
    outlineOffset: '-0.5rem',
  };

  return <div aria-hidden="true" className="__rcs-handle-arrow" style={style} />;
};

/** Props for `ReactCompareSliderHandle`. */
export type HandleProps = {
  /** Optional styles for the circular element in the middle of the handle. */
  buttonStyle?: CSSProperties;
  /** Optional styles for lines either side of the handle button. */
  linesStyle?: CSSProperties;
};

export type HandleDetailedProps = ComponentProps<'div'> & HandleProps;

/**
 * Default `handle` of the `ReactCompareSlider` component. This should be placed within the `HandleRoot`
 * component when building your own slider.
 */
export const Handle: FC<HandleDetailedProps> = ({
  className = '__rcs-handle-root',
  buttonStyle,
  linesStyle,
  style,
  ...props
}) => {
  const { disabled, portrait } = useReactCompareSliderContext();

  const appliedStyle = {
    boxSizing: 'border-box',
    position: 'relative',
    display: 'inline-flex',
    flexDirection: portrait ? 'row' : 'column',
    placeItems: 'center',
    width: portrait ? '100%' : undefined,
    height: portrait ? undefined : '100%',
    cursor: disabled ? 'not-allowed' : portrait ? 'ns-resize' : 'ew-resize',
    pointerEvents: 'none',
    [ReactCompareSliderCssVars.handleColor]: 'rgba(255, 255, 255, 1)',
    ...style,
  } as CSSProperties;

  const appliedLinesStyle: CSSProperties = {
    flexGrow: 1,
    height: portrait ? 2 : '100%',
    width: portrait ? '100%' : 2,
    // We use `outline` instead of `border` to ensure that all line colours match in high contrast mode.
    outline: `1px solid var(${ReactCompareSliderCssVars.handleColor})`,
    outlineOffset: -1,
    pointerEvents: 'auto',
    boxShadow: '0 0 4px rgba(0,0,0,.5)',
    ...linesStyle,
  };

  const appliedButtonStyle: CSSProperties = {
    // Prevents the arrows from pointing at each other in RTL.
    direction: 'ltr',
    display: 'grid',
    gridAutoFlow: 'column',
    gap: '0.5rem',
    placeContent: 'center',
    flexShrink: 0,
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    border: `2px solid var(${ReactCompareSliderCssVars.handleColor})`,
    color: 'inherit',
    pointerEvents: 'auto',
    backdropFilter: 'blur(0.5rem)',
    WebkitBackdropFilter: 'blur(0.5rem)', // For Safari.
    backgroundColor: 'rgba(0, 0, 0, 0.125)',
    boxShadow: '0 0 4px rgba(0,0,0,.35)',
    transform: portrait ? 'rotate(90deg)' : undefined,
    ...buttonStyle,
  };

  return (
    <div data-rcs="handle" {...props} className={className} style={appliedStyle}>
      <div className="__rcs-handle-line" style={appliedLinesStyle} />
      <div className="__rcs-handle-button" style={appliedButtonStyle}>
        <ThisArrow />
        <ThisArrow flip />
      </div>
      <div className="__rcs-handle-line" style={appliedLinesStyle} />
    </div>
  );
};
