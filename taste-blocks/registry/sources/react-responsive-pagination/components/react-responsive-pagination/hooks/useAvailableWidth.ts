import { useState } from 'react';
import { useContentWidth } from './useContentWidth.ts';

export function useAvailableWidth(overrideWidth: number | undefined) {
  const [element, setElement] = useState<Element | null>(null);

  const parentElement = element?.parentElement ?? undefined;

  const width = useContentWidth(
    overrideWidth === undefined ? parentElement : undefined,
  );

  return {
    width: overrideWidth ?? width,
    ref: setElement,
  };
}
