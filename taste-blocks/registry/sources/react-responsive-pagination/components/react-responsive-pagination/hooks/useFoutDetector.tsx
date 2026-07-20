import { useRef } from 'react';
import { useIsomorphicLayoutEffect } from '../helpers/react.ts';
import { getWidth } from '../helpers/style.ts';
import { flushSync } from 'react-dom';

export function useFoutDetector(
  getElements: (element: Element | null) => Element[] | null,
  handleFout: () => void,
) {
  const containerRef = useRef<Element | null>(null);

  useIsomorphicLayoutEffect(() => {
    const elements = getElements(containerRef.current);

    if (!elements) return;

    const widthsAtRender = new Map(
      elements.map(element => [element, getWidth(element)]),
    );

    const resizeObserver = new ResizeObserver(entries => {
      const hasAnElementChangedSignificantly = entries
        .map(entry => widthsAtRender.get(entry.target)! - getWidth(entry.target))
        .some(difference => difference < -0.5 || difference > 0.5);

      hasAnElementChangedSignificantly && flushSync(handleFout);
    });

    elements.forEach(element => resizeObserver.observe(element));

    return () => resizeObserver.disconnect();
  });

  return containerRef;
}
