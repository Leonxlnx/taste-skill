import { useCallback, useState } from 'react';
import type { CompositionItem } from '../compositionItem.ts';
import { useAvailableWidth } from './useAvailableWidth.ts';
import { useFoutDetector } from './useFoutDetector.tsx';
import { useWidthCalculator } from './useWidthCalculator.tsx';
import { iteratorNext, lastWhere } from '../helpers/iterator.ts';

export function useWidestComposition(
  narrowToWideCompositionsProvider: () => IterableIterator<CompositionItem[]>,
  maxWidth?: number,
): {
  items: CompositionItem[];
  ref: (element: Element | null) => void;
  visible: boolean;
  clearCache: () => void;
} {
  const { widthCalculator, metricsRender, clearCache } = useWidthCalculator();

  const foutDetectorRef = useFoutDetector(getItemsDomElements, clearCache);

  const { width = 0, ref: availableWidthRef } = useAvailableWidth(maxWidth);

  const ref = useCallback(
    (element: Element | null) => {
      foutDetectorRef.current = element;
      availableWidthRef?.(element);
    },
    [foutDetectorRef, availableWidthRef],
  );

  const [showPlaceholder, setShowPlaceholder] = useState(true);
  if (showPlaceholder) {
    const firstComposition = iteratorNext(narrowToWideCompositionsProvider());
    return {
      visible: false,
      items: firstComposition ?? [],
      ref(containerElement) {
        setShowPlaceholder(false);
        ref(containerElement);
      },
      clearCache,
    };
  }

  if (metricsRender) {
    return {
      visible: false,
      items: metricsRender.items,
      ref(containerElement) {
        metricsRender.ref(containerElement);
        ref(containerElement);
      },
      clearCache,
    };
  }

  return {
    visible: true,
    items: getLargestFittingCompositionWithFallback(
      narrowToWideCompositionsProvider,
      widthCalculator,
      width,
    ),
    ref,
    clearCache,
  };
}

function getLargestFittingCompositionWithFallback(
  getNarrowToWideCompositions: () => IterableIterator<CompositionItem[]>,
  getCompositionWidth: (items: CompositionItem[]) => number,
  maxWidth: number,
) {
  const narrowToWideCompositions = getNarrowToWideCompositions();

  const firstComposition = iteratorNext(narrowToWideCompositions) ?? [];

  const doesCompositionFit = (composition: CompositionItem[]) =>
    getCompositionWidth(composition) < maxWidth;

  return lastWhere(narrowToWideCompositions, doesCompositionFit) ?? firstComposition;
}

function getItemsDomElements(viewDomElement: Element | null) {
  return viewDomElement && Array.from(viewDomElement.children);
}
