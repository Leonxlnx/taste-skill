'use client';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {ProgressBar} from 'react-aria-components/ProgressBar';
import type {ProgressBarProps} from 'react-aria-components/ProgressBar';

export interface ProgressCircleProps extends ProgressBarProps {
  size?: number;
}

export function ProgressCircle(props: ProgressCircleProps) {
  // SVG strokes are centered, so subtract half the stroke width from the radius to create an inner stroke.
  let strokeWidth = 4;
  let radius = `calc(50% - ${strokeWidth / 2}px)`;

  return (
    <ProgressBar
      {...props}
      style={composeRenderProps(props.style, style => ({
        ...style,
        width: props.size || 16,
        height: props.size || 16
      }))}>
      {({percentage, isIndeterminate}) => (
        <>
          <svg fill="none" width="100%" height="100%" viewBox="0 0 32 32">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="var(--highlight-pressed)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="var(--highlight-background)"
              strokeWidth={strokeWidth}
              // Normalize the path length to 100 so we can easily set stroke-dashoffset to a percentage.
              pathLength="100"
              // Add extra gap between dashes so 0% works in Chrome.
              strokeDasharray="100 200"
              strokeDashoffset={100 - (isIndeterminate || percentage == null ? 25 : percentage)}
              strokeLinecap="round"
              style={{
                rotate: '-90deg',
                transformOrigin: 'center center'
              }}>
              {isIndeterminate && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  dur="0.75s"
                  values="0;360"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </svg>
        </>
      )}
    </ProgressBar>
  );
}
