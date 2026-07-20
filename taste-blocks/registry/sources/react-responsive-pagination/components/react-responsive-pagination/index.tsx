'use client';

import React, { memo, useEffect } from 'react';
import type { ReactNode, FC } from 'react';
import PropTypes from 'prop-types';
import { usePaginationItems } from './hooks/usePaginationItems.tsx';
import type { PaginationItem } from './paginationItem.ts';
import type { NarrowBehaviour } from './narrowBehaviour.ts';
import type { LabelBehaviour } from './labelBehaviour.tsx';
import { defaultLabelBehaviour } from './labelBehaviour.tsx';
import { incRenderCount } from './debug.ts';

export * from './narrowBehaviour.ts';
export * from './presets.tsx';
export * from './labelBehaviour.tsx';

declare const process: { env: { NODE_ENV: string } };

/**
 * @public
 */
const ResponsivePaginationComponent: FC<ResponsivePaginationProps> =
  memo(ResponsivePagination);
export default ResponsivePaginationComponent;

function ResponsivePagination(props: ResponsivePaginationProps) {
  incRenderCount();

  if (process.env.NODE_ENV !== 'production') {
    checkLegacyProps(props);
  }

  const {
    current,
    total,
    onPageChange: handlePageChange,
    maxWidth,
    narrowBehaviour,
    navigationLabel = 'Pagination',
    direction = 'ltr',
    className,
    containerClassName,
    extraClassName = 'm-0 flex max-w-full list-none items-center justify-center gap-1 p-0',
    pageItemClassName = 'shrink-0',
    pageLinkClassName =
      'flex size-11 items-center justify-center rounded-full border border-transparent text-sm font-medium text-neutral-700 no-underline outline-none hover:bg-neutral-100 focus-visible:border-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2',
    activeItemClassName = '[&>a]:bg-neutral-950 [&>a]:text-white',
    inactiveItemClassName = '',
    disabledItemClassName = 'pointer-events-none opacity-40',
    navClassName,
    previousClassName,
    nextClassName,
    classMerge = defaultClassMerge,
    previousLabel = direction === 'rtl' ? '→' : '←',
    nextLabel = direction === 'rtl' ? '←' : '→',
    ariaPreviousLabel = 'Previous page',
    ariaNextLabel = 'Next page',
    ariaPageLabel,
    renderNav = 'anchor-disabled-span',
    ariaCurrentAttr = true,
    linkHref = 'hash',
    labelBehaviour: getLabel = defaultLabelBehaviour,
  } = props;

  const { visible, items, ref, clearCache } = usePaginationItems(current, total, {
    handlePageChange,
    previousLabel,
    nextLabel,
    ariaPreviousLabel,
    ariaNextLabel,
    ariaPageLabel,
    ariaCurrentAttr,
    linkHref,
    maxWidth,
    omitNav: ['none', false].includes(renderNav),
    narrowBehaviour,
  });

  useEffect(() => {
    return () => clearCache();
  }, [
    clearCache,
    className,
    containerClassName,
    pageItemClassName,
    pageLinkClassName,
    activeItemClassName,
    inactiveItemClassName,
    disabledItemClassName,
    navClassName,
    previousClassName,
    nextClassName,
    classMerge,
  ]);

  if (items.length === 0) return null;

  function getContainerClassName() {
    if (className !== undefined) {
      return className;
    } else if (containerClassName !== undefined) {
      return containerClassName;
    } else if (extraClassName) {
      return `pagination ${extraClassName}`;
    } else {
      return 'pagination';
    }
  }

  function getListItemClassName(item: PaginationItem) {
    return classNames(classMerge, [
      pageItemClassName,
      item.gotoPage === undefined
        ? disabledItemClassName
        : item.active
          ? activeItemClassName
          : inactiveItemClassName,
      item.type === 'next' && (nextClassName ?? navClassName),
      item.type === 'previous' && (previousClassName ?? navClassName),
    ]);
  }

  return (
    <nav aria-label={navigationLabel} dir={direction}>
      <ul
        className={getContainerClassName()}
        ref={ref}
        {...(!visible && { style: { visibility: 'hidden' } })}
      >
        {items.map(item => (
          <li
            key={item.key}
            className={getListItemClassName(item)}
            {...item.listItemProps}
          >
            {item.type === 'previous' || item.type === 'next' ? (
              renderNav === 'button' ? (
                <button className={pageLinkClassName} {...item.buttonProps}>
                  {getLabel(item)}
                </button>
              ) : item.gotoPage !== undefined || renderNav === 'anchor' ? (
                <a className={pageLinkClassName} {...item.anchorProps}>
                  {getLabel(item)}
                </a>
              ) : (
                <span className={pageLinkClassName} {...item.spanAsAnchorProps}>
                  {getLabel(item)}
                </span>
              )
            ) : item.type === 'ellipsis' ? (
              <span className={pageLinkClassName}>{getLabel(item)}</span>
            ) : (
              // page
              <a className={pageLinkClassName} {...item.anchorProps}>
                {getLabel(item)}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function classNames(
  classMerge: (classNames: string[]) => string,
  names: (string | false | undefined)[],
) {
  return classMerge(names.filter((name): name is string => Boolean(name)));
}

const defaultClassMerge = (classNames: string[]) => classNames.join(' ');

/**
 * @public
 */
export type ResponsivePaginationProps = {
  current: number;
  total: number;
  onPageChange: (page: number) => void;
  maxWidth?: number;
  narrowBehaviour?: NarrowBehaviour;
  navigationLabel?: string;
  direction?: 'ltr' | 'rtl';
  className?: string;
  containerClassName?: string;
  extraClassName?: string;
  pageItemClassName?: string;
  pageLinkClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  disabledItemClassName?: string;
  disabledLinkClassName?: string;
  navClassName?: string;
  previousClassName?: string;
  nextClassName?: string;
  classMerge?: (classNames: string[]) => string;
  previousLabel?: string | ReactNode;
  nextLabel?: string | ReactNode;
  ariaPreviousLabel?: string;
  ariaNextLabel?: string;
  ariaPageLabel?: (page: number, active: boolean) => string | undefined;
  renderNav?: boolean | 'none' | 'anchor' | 'anchor-disabled-span' | 'button';
  ariaCurrentAttr?: boolean;
  linkHref?: ((page: number) => string) | 'hash' | 'omit';
  labelBehaviour?: LabelBehaviour;
};

ResponsivePagination.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxWidth: PropTypes.number,
  narrowBehaviour: PropTypes.func,
  navigationLabel: PropTypes.string,
  direction: PropTypes.oneOf(['ltr', 'rtl'] as const),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  extraClassName: PropTypes.string,
  pageItemClassName: PropTypes.string,
  pageLinkClassName: PropTypes.string,
  activeItemClassName: PropTypes.string,
  inactiveItemClassName: PropTypes.string,
  disabledItemClassName: PropTypes.string,
  disabledLinkClassName: PropTypes.string,
  navClassName: PropTypes.string,
  previousClassName: PropTypes.string,
  nextClassName: PropTypes.string,
  classMerge: PropTypes.func,
  previousLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  nextLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  ariaPreviousLabel: PropTypes.string,
  ariaNextLabel: PropTypes.string,
  ariaPageLabel: PropTypes.func,
  renderNav: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['none', 'anchor', 'anchor-disabled-span', 'button'] as const),
  ]),
  ariaCurrentAttr: PropTypes.bool,
  linkHref: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.oneOf(['hash', 'omit'] as const),
  ]),
  labelBehaviour: PropTypes.func,
};

const legacyUsageWarnings: string[] = [];

function checkLegacyProps(props: { [key in string]: unknown }) {
  for (const legacyProp of [
    'srOnlyClassName',
    'a11yActiveLabel',
    'narrowStrategy',
  ]) {
    if (
      props[legacyProp] !== undefined &&
      !legacyUsageWarnings.includes(legacyProp)
    ) {
      console.warn(
        `react-responsive-pagination: '${legacyProp}' prop no longer supported, please see migration guide: https://react-responsive-pagination.elantha.com/migration`,
      );
      legacyUsageWarnings.push(legacyProp);
    }
  }
}
