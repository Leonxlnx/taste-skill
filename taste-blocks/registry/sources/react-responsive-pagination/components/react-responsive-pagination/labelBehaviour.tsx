import React from 'react';
import type { ReactNode } from 'react';
import type { PaginationItem } from './paginationItem.ts';

/**
 * @public
 */
export type LabelBehaviour = (item: PaginationItem) => ReactNode;

/**
 * @public
 */
export function defaultLabelBehaviour({
  a11yLabel,
  label,
}: PaginationItem): ReactNode {
  return !a11yLabel ? label : <span aria-hidden="true">{label}</span>;
}

/**
 * @public
 */
export function srOnlySpanLabel({
  a11yActiveLabel = '(current)',
  srOnlyClassName = 'sr-only',
}: {
  a11yActiveLabel?: string;
  srOnlyClassName?: string;
} = {}) {
  // eslint-disable-next-line react/display-name
  return (item: PaginationItem): ReactNode => {
    const activePage = item.gotoPage !== undefined && item.active;
    const srOnlyLabel =
      activePage && a11yActiveLabel ? ` ${a11yActiveLabel}` : item.a11yLabel;

    return (
      <>
        {!item.a11yLabel ? item.label : <span aria-hidden="true">{item.label}</span>}
        {srOnlyLabel && <span className={srOnlyClassName}>{srOnlyLabel}</span>}
      </>
    );
  };
}
