import { isValidElement, useEffect } from 'react';
import type { ReactNode } from 'react';
import { narrowToWideCompositions } from '../compositions/index.ts';
import { sanatizeInteger, sanatizeBoolean } from '../helpers/util.ts';
import type { NarrowBehaviour } from '../narrowBehaviour.ts';
import { compositionToPaginationItems } from '../paginationItem.ts';
import type { CompositionToPaginationItemsOptions } from '../paginationItem.ts';
import { useWidestComposition } from './useWidestComposition.tsx';

type UsePaginationItemsOptions = Partial<CompositionToPaginationItemsOptions> & {
  maxWidth?: number;
  omitNav?: boolean;
  narrowBehaviour?: NarrowBehaviour;
};

export function usePaginationItems(
  inputCurrent: number,
  inputTotal: number,
  inputOptions?: UsePaginationItemsOptions,
) {
  const { current, total, options } = sanatizeInputs(
    inputCurrent,
    inputTotal,
    inputOptions,
  );

  const narrowToWideCompositionsProvider = () =>
    narrowToWideCompositions({
      current,
      total,
      narrowBehaviour: options.narrowBehaviour,
      omitNav: options.omitNav,
    });

  const {
    visible,
    items: compositionItems,
    ref,
    clearCache,
  } = useWidestComposition(narrowToWideCompositionsProvider, options.maxWidth);

  const previousLabelCacheKey = labelCacheKey(options.previousLabel);
  const nextLabelCacheKey = labelCacheKey(options.nextLabel);

  useEffect(() => {
    return () => clearCache();
  }, [clearCache, previousLabelCacheKey, nextLabelCacheKey]);

  const items = compositionToPaginationItems(compositionItems, options);

  return { visible, items, ref, clearCache };
}

function sanatizeInputs(
  current: number,
  total: number,
  options?: UsePaginationItemsOptions,
) {
  return {
    current: sanatizeInteger(current) ?? 0,
    total: sanatizeInteger(total) ?? 0,
    options: {
      handlePageChange: options?.handlePageChange,
      nextLabel: options?.nextLabel || '»',
      previousLabel: options?.previousLabel || '«',
      ariaNextLabel: options?.ariaNextLabel || 'Next',
      ariaPreviousLabel: options?.ariaPreviousLabel || 'Previous',
      ariaPageLabel: options?.ariaPageLabel,
      ariaCurrentAttr: sanatizeBoolean(options?.ariaCurrentAttr) ?? true,
      linkHref: options?.linkHref ?? 'hash',
      maxWidth: options?.maxWidth,
      omitNav: sanatizeBoolean(options?.omitNav) ?? false,
      narrowBehaviour: options?.narrowBehaviour,
    },
  };
}

function labelCacheKey(item: string | ReactNode) {
  if (isValidElement(item)) {
    process.env.NODE_ENV !== 'production' && showReactElementLabelWarning();

    // This is not exhaustive
    // but should pick up on many situations when an element changes
    switch (typeof item.type) {
      case 'string':
        return `element-str-${item.type}`;

      case 'function':
        return `element-fn-${item.type.name}`;

      default:
        return 'element';
    }
  } else if (Array.isArray(item)) {
    process.env.NODE_ENV !== 'production' && showReactElementLabelWarning();

    return 'element-array';
  } else {
    return item;
  }
}

let reactElementLabelWarningShown = false;

function showReactElementLabelWarning() {
  if (reactElementLabelWarningShown) return;

  console.log(
    'react-responsive-pagination: using React elements for labels is experimental, please see: https://react-responsive-pagination.elantha.com/faq#using-react-components-for-labels',
  );
  reactElementLabelWarningShown = true;
}
