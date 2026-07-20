import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';
import type { CompositionItem } from './compositionItem.ts';
import { preventDefault } from './helpers/dom.ts';

type BaseItem = {
  type: string;
  key: string;
  label: string | ReactNode;
  a11yLabel?: string;
  active?: boolean | undefined;
  gotoPage?: number | undefined;
  listItemProps?: HTMLAttributes<HTMLLIElement> | undefined;
};

type PageItem = BaseItem & {
  type: 'page';
  gotoPage: number;
  active?: boolean;
  anchorProps: AnchorHTMLAttributes<HTMLAnchorElement>;
};

type NavBase = BaseItem & {
  type: NavType;
  anchorProps: AnchorHTMLAttributes<HTMLAnchorElement>;
  buttonProps: ButtonHTMLAttributes<HTMLButtonElement>;
};

type NavItem = NavBase & {
  gotoPage: number;
};

type NavDisabledItem = NavBase & {
  gotoPage?: undefined;
  spanAsAnchorProps: HTMLAttributes<HTMLSpanElement>;
};

type EllipsisItem = BaseItem & {
  type: 'ellipsis';
  gotoPage?: undefined;
};

export type PaginationItem = NavItem | NavDisabledItem | EllipsisItem | PageItem;

export type NavType = 'next' | 'previous';

export type CompositionToPaginationItemsOptions = {
  handlePageChange: ((page: number) => void) | undefined;
  previousLabel: string | ReactNode;
  nextLabel: string | ReactNode;
  ariaPreviousLabel: string;
  ariaNextLabel: string;
  ariaPageLabel: ((page: number, active: boolean) => string | undefined) | undefined;
  ariaCurrentAttr: boolean;
  linkHref: ((page: number) => string) | 'hash' | 'omit';
};

export const compositionToPaginationItems = (
  compositionItems: CompositionItem[],
  {
    handlePageChange,
    previousLabel,
    nextLabel,
    ariaPreviousLabel,
    ariaNextLabel,
    ariaPageLabel,
    ariaCurrentAttr,
    linkHref,
  }: CompositionToPaginationItemsOptions,
): PaginationItem[] =>
  compositionItems.map(({ type, page }) => {
    switch (type) {
      case '<':
      case '>': {
        const fullType = type === '<' ? 'previous' : 'next';
        const label = type === '<' ? previousLabel : nextLabel;
        const optionsAriaLabel = type === '<' ? ariaPreviousLabel : ariaNextLabel;
        const ariaLabel = optionsAriaLabel === label ? undefined : optionsAriaLabel;

        return {
          type: fullType,
          key: `${fullType}${page === undefined ? '_disabled' : ''}`,
          label,
          a11yLabel: ariaLabel,
          ...(page === undefined
            ? {
                anchorProps: {
                  'aria-label': ariaLabel,
                  'aria-disabled': 'true',
                  role: 'link',
                },
                spanAsAnchorProps: {
                  'aria-label': ariaLabel,
                  'aria-disabled': 'true',
                  role: 'link',
                },
                buttonProps: {
                  'aria-label': ariaLabel,
                  disabled: true,
                },
              }
            : {
                gotoPage: page,
                anchorProps: {
                  href: getHref(linkHref, page),
                  onClick:
                    handlePageChange && preventDefault(() => handlePageChange(page)),
                  'aria-label': ariaLabel,
                },
                buttonProps: {
                  onClick: handlePageChange && (() => handlePageChange(page)),
                  'aria-label': ariaLabel,
                },
              }),
        };
      }
      case '…L':
      case '…R':
        return {
          type: 'ellipsis',
          key: `ellipsis_${type === '…L' ? 'l' : 'r'}`,
          label: '…',
          listItemProps: { 'aria-hidden': 'true' },
          gotoPage: undefined,
        };
      default: {
        const ariaLabel = ariaPageLabel?.(page, type === 'active');
        return {
          type: 'page',
          key: `${type}_${page}`,
          label: page.toString(),
          a11yLabel: ariaLabel,
          gotoPage: page,
          active: type === 'active',
          listItemProps:
            type === 'active' && ariaCurrentAttr
              ? { 'aria-current': 'page' }
              : undefined,
          anchorProps: {
            href: getHref(linkHref, page),
            onClick:
              handlePageChange && preventDefault(() => handlePageChange(page)),
            'aria-label': ariaLabel,
          },
        };
      }
    }
  });

function getHref(
  linkHref: ((page: number) => string) | 'hash' | 'omit',
  page: number,
) {
  if (typeof linkHref === 'function') {
    return linkHref(page);
  } else if (linkHref === 'hash') {
    return '#';
  } else {
    return undefined;
  }
}
