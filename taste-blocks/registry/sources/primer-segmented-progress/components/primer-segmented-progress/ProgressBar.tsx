import React, {forwardRef} from 'react'
import {clsx} from 'clsx'
import classes from './ProgressBar.module.css'

type ProgressProp = {
  className?: string
  progress?: string | number
  bg?: string
}

type StyledProgressContainerProps = {
  inline?: boolean
  barSize?: 'small' | 'default' | 'large'
  animated?: boolean
}

function clampProgress(progress: string | number | undefined) {
  const value = typeof progress === 'string' ? Number(progress) : progress
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
}

export type ProgressBarItemProps = React.HTMLAttributes<HTMLSpanElement> & {
  'aria-label'?: string
  className?: string
} & ProgressProp

export const Item = forwardRef<HTMLSpanElement, ProgressBarItemProps>(
  (
    {
      progress,
      'aria-label': ariaLabel,
      'aria-valuenow': ariaValueNow,
      'aria-valuetext': ariaValueText,
      className,
      style,
      bg,
      ...rest
    },
    forwardRef,
  ) => {
    const progressAsNumber = clampProgress(progress)

    const ariaAttributes = {
      'aria-valuenow': Math.round(ariaValueNow === undefined ? progressAsNumber : clampProgress(ariaValueNow)),
      'aria-valuemin': 0,
      'aria-valuemax': 100,
      'aria-valuetext': ariaValueText,
    }

    const progressBarWidth = '--progress-width'
    const progressBarBg = '--progress-bg'
    const styles: {[key: string]: string} = {}

    const bgType = bg && bg.split('.')
    styles[progressBarWidth] = `${progressAsNumber}%`
    styles[progressBarBg] =
      (bgType && `var(--bgColor-${bgType[0]}-${bgType[1] || 'emphasis'}, #1f883d)`) ||
      'var(--bgColor-success-emphasis, #1f883d)'

    return (
      <span
        data-component="ProgressBar.Item"
        className={clsx(className, classes.ProgressBarItem)}
        {...rest}
        role="progressbar"
        aria-label={ariaLabel}
        ref={forwardRef}
        style={{...styles, ...style}}
        {...ariaAttributes}
      />
    )
  },
)

Item.displayName = 'ProgressBar.Item'

export type ProgressBarProps = React.HTMLAttributes<HTMLSpanElement> & {
  bg?: string
  className?: string
} & StyledProgressContainerProps &
  ProgressProp

export const ProgressBar = forwardRef<HTMLSpanElement, ProgressBarProps>(
  (
    {
      animated,
      progress,
      bg = 'success.emphasis',
      barSize = 'default',
      children,
      'aria-label': ariaLabel,
      'aria-valuenow': ariaValueNow,
      'aria-valuetext': ariaValueText,
      className,
      inline,
      ...rest
    }: ProgressBarProps,
    forwardRef,
  ) => {
    if (children && progress) {
      throw new Error('You should pass `progress` or children, not both.')
    }

    // Get the number of non-empty nodes passed as children, this will exclude
    // booleans, null, and undefined
    const validChildren = React.Children.toArray(children).length

    return (
      <span
        ref={forwardRef}
        data-component="ProgressBar"
        className={clsx(className, classes.ProgressBarContainer)}
        data-progress-display={inline ? 'inline' : 'block'}
        data-progress-bar-size={barSize}
        {...rest}
      >
        {validChildren ? (
          children
        ) : (
          <Item
            data-animated={animated}
            progress={progress}
            aria-label={ariaLabel}
            aria-valuenow={ariaValueNow}
            aria-valuetext={ariaValueText}
            bg={bg}
          />
        )}
      </span>
    )
  },
)

ProgressBar.displayName = 'ProgressBar'
