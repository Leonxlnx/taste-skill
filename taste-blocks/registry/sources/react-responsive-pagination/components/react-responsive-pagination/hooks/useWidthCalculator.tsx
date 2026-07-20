import { useState, useCallback } from 'react';
import {
  getElementWidth,
  getNonContentWidth,
  getColumnGap,
} from '../helpers/style.ts';
import type { CompositionItem } from '../compositionItem.ts';
import {
  createActivePage,
  createEllipsis,
  createNavNext,
  createNavPrevious,
  createPage,
} from '../compositionItem.ts';

export function useWidthCalculator(): MetricsRenderResult | CalculatorResult {
  const [widthCalculator, setWidthCalculator] = useState<
    WidthCalculator | undefined
  >(undefined);

  const clearCache = useCallback(() => setWidthCalculator(undefined), []);

  if (!widthCalculator) {
    return {
      metricsRender: {
        items: itemsToMeasure,
        ref(containerElement) {
          const metrics = getMetricsFromMetricsRender(containerElement);

          metrics && setWidthCalculator(() => createWidthCalculator(metrics));
        },
      },
      clearCache,
    };
  }

  return {
    widthCalculator,
    clearCache,
  };
}

type MetricsRenderResult = {
  metricsRender: {
    items: CompositionItem[];
    ref: (element: Element | null) => void;
  };
  widthCalculator?: undefined;
  clearCache: () => void;
};

type CalculatorResult = {
  metricsRender?: undefined;
  widthCalculator: WidthCalculator;
  clearCache: () => void;
};

function getMetricsFromMetricsRender(containerElement: Element | null) {
  if (!containerElement) return;

  return [
    getNonContentWidth(containerElement),
    getColumnGap(containerElement),
    ...Array.from(containerElement.children).map(getElementWidth),
  ] as Metrics;
}

function createWidthCalculator([
  outerFrameWidth,
  columnGap,
  pageSingleDigitWidth,
  pageDoubleDigitWidth,
  activeSingleDigitWidth,
  activeDoubleDigitWidth,
  navPreviousEnabledWidth,
  navPreviousDisabledWidth,
  navNextEnabledWidth,
  navNextDisabledWidth,
  ellipsisWidth,
]: Metrics) {
  const getItemWidth = ({ type, page }: CompositionItem) => {
    switch (type) {
      case 'page':
        return (
          pageSingleDigitWidth +
          (pageDoubleDigitWidth - pageSingleDigitWidth) *
            (page.toString().length - 1)
        );

      case 'active':
        return (
          activeSingleDigitWidth +
          (activeDoubleDigitWidth - activeSingleDigitWidth) *
            (page.toString().length - 1)
        );

      case '<':
        return page !== undefined
          ? navPreviousEnabledWidth
          : navPreviousDisabledWidth;

      case '>':
        return page !== undefined ? navNextEnabledWidth : navNextDisabledWidth;

      case '…L':
      case '…R':
        return ellipsisWidth;

      default: {
        const _exCheck: never = type;
        return _exCheck;
      }
    }
  };

  return (items: CompositionItem[]) =>
    outerFrameWidth +
    columnGap * Math.max(items.length - 1, 0) +
    items.reduce((acc, item) => acc + getItemWidth(item), 0);
}

const itemsToMeasure: ItemsToMeasure = [
  createPage(8),
  createPage(88),
  createActivePage(8),
  createActivePage(88),
  createNavPrevious(0),
  createNavPrevious(undefined),
  createNavNext(0),
  createNavNext(undefined),
  createEllipsis('L'),
];

type Metrics = [
  OuterWidth: number,
  Gap: number,
  PageSingleDigit: number,
  PageDoubleDigit: number,
  ActiveSingleDigit: number,
  ActiveDoubleDigit: number,
  NavPreviousEnabled: number,
  NavPreviousDisabled: number,
  NavNextEnabled: number,
  NavNextDisabled: number,
  Ellipsis: number,
];

type ItemsToMeasure = [
  PageSingleDigit: CompositionItem,
  PageDoubleDigit: CompositionItem,
  ActiveSingleDigit: CompositionItem,
  ActiveDoubleDigit: CompositionItem,
  NavPreviousEnabled: CompositionItem,
  NavPreviousDisabled: CompositionItem,
  NavNextEnabled: CompositionItem,
  NavNextDisabled: CompositionItem,
  Ellipsis: CompositionItem,
];

type WidthCalculator = (items: CompositionItem[]) => number;
