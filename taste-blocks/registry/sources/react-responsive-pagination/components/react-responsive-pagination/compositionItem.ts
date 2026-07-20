import { UnsupportedValueError } from './helpers/util.ts';

type CompositionPage = { type: 'page'; page: number };
type CompositionActivePage = { type: 'active'; page: number };
type CompositionEllipsis = { type: '…L' | '…R'; page: undefined };
type CompositionPrevious = { type: '<'; page: number | undefined };
type CompositionNext = { type: '>'; page: number | undefined };

export type CompositionItem =
  | CompositionPage
  | CompositionActivePage
  | CompositionEllipsis
  | CompositionPrevious
  | CompositionNext;

export function createActivePage(page: number): CompositionActivePage {
  return { type: 'active', page };
}

export function createPage(page: number): CompositionPage {
  return { type: 'page', page };
}

export function createNavPrevious(page: number | undefined): CompositionPrevious {
  return { type: '<', page };
}

export function createNavNext(page: number | undefined): CompositionNext {
  return { type: '>', page };
}

export function createEllipsis(ellipsisPos: 'L' | 'R'): CompositionEllipsis {
  return { type: `…${ellipsisPos}`, page: undefined };
}

export function isNav(
  item: CompositionItem,
): item is CompositionPrevious | CompositionNext {
  return item.type === '<' || item.type === '>';
}

export function isEllipsis(item: CompositionItem): item is CompositionEllipsis {
  return item.type === '…L' || item.type === '…R';
}

export function containsEllipsis(composition: ReadonlyArray<CompositionItem>) {
  return composition.some(isEllipsis);
}

export function isPageWithNumber(
  item: CompositionItem,
  page: number,
): item is CompositionPage {
  return item.type === 'page' && item.page === page;
}

export function getLastPage(composition: ReadonlyArray<CompositionItem>) {
  return Math.max(
    ...composition
      .filter(
        (item): item is CompositionPage | CompositionActivePage =>
          item.type === 'active' || item.type === 'page',
      )
      .map(item => item.page),
  );
}

export function compositionMatches(
  composition: ReadonlyArray<CompositionItem>,
  startIndex: number,
  pattern: (number | '#' | '…' | '*')[],
) {
  if (startIndex < 0) return;

  return pattern.every((matchItem, patternIndex) => {
    if (!composition[startIndex + patternIndex]) return false;

    const { type, page } = composition[startIndex + patternIndex];

    if (typeof matchItem === 'number') {
      return type === 'page' && page === matchItem;
    } else if (matchItem === '#') {
      return type === 'page';
    } else if (matchItem === '…') {
      return type === '…L' || type === '…R';
    } else if (matchItem === '*') {
      return type === 'active';
    } else {
      throw new UnsupportedValueError(matchItem);
    }
  });
}

export function compositionMatchesEnd(
  composition: ReadonlyArray<CompositionItem>,
  endIndex: number,
  pattern: (number | '#' | '…' | '*')[],
) {
  return compositionMatches(composition, endIndex - pattern.length + 1, pattern);
}
