import { createEllipsis, createPage } from '../compositionItem.ts';

function* narrowToWidePaginationItemRanges(
  start: number,
  end: number,
  collapsePos: 'L' | 'R',
) {
  for (const range of narrowToWideNumberRanges(start, end, collapsePos)) {
    yield range.map(item =>
      item === '…' ? createEllipsis(collapsePos) : createPage(item),
    );
  }
}

export { narrowToWidePaginationItemRanges as narrowToWideRanges };

function* narrowToWideNumberRanges(
  first: number,
  last: number,
  collapsePos: 'L' | 'R',
) {
  const fullWidth = last - first + 1;

  for (let iterationWidth = 1; iterationWidth < fullWidth; iterationWidth++) {
    const range = getCollapsedRange(first, last, iterationWidth, collapsePos);

    if (range) yield range;
  }

  yield getFullRange(first, last);
}

function getCollapsedRange(
  first: number,
  last: number,
  requiredWidth: number,
  collapsePos: 'L' | 'R',
): NumberRange | undefined {
  if (requiredWidth < 3) return;

  const widthOfRange = requiredWidth - 2;

  return collapsePos === 'L'
    ? [first, '…', ...getFullRange(last - (widthOfRange - 1), last)]
    : [...getFullRange(first, first + (widthOfRange - 1)), '…', last];
}

function getFullRange(start: number, end: number) {
  if (end < start) return [];

  return Array.from(Array(end - start + 1).keys(), i => i + start);
}

type NumberRange = NumberRangeItem[];

type NumberRangeItem = number | '…';
