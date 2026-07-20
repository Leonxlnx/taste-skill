import {
  createActivePage,
  createNavNext,
  createNavPrevious,
} from '../compositionItem.ts';
import type { CompositionItem } from '../compositionItem.ts';
import { zipIterators } from '../helpers/iterator.ts';
import type { NarrowBehaviour } from '../narrowBehaviour.ts';
import { narrowToWideRanges } from './ranges.ts';

export function* narrowToWideCompositions({
  current,
  total,
  narrowBehaviour,
  omitNav,
}: {
  current: number;
  total: number;
  narrowBehaviour: NarrowBehaviour | undefined;
  omitNav: boolean;
}) {
  if (total < 1) return;

  const clampedCurrent = Math.max(1, Math.min(current, total));

  const compositions = narrowToWideCompositionsUnfiltered(
    clampedCurrent,
    total,
    omitNav,
  );

  for (const initialComposition of compositions) {
    if (narrowBehaviour) yield* narrowBehaviour(initialComposition);

    yield initialComposition;

    yield* compositions;
  }
}

export function* narrowToWideCompositionsUnfiltered(
  current: number,
  total: number,
  omitNav: boolean,
): Generator<CompositionItem[]> {
  const navPrevious = createNavPrevious(current > 1 ? current - 1 : undefined);
  const navNext = createNavNext(current < total ? current + 1 : undefined);
  const activePage = createActivePage(current);

  const leftRanges = narrowToWideRanges(1, current - 1, 'L');
  const rightRanges = narrowToWideRanges(current + 1, total, 'R');

  const staggeredPairs = staggeredIterationRightRangeFirst(leftRanges, rightRanges);

  for (const { leftRange, rightRange } of staggeredPairs) {
    if (omitNav) {
      yield [...leftRange, activePage, ...rightRange];
    } else {
      yield [navPrevious, ...leftRange, activePage, ...rightRange, navNext];
    }
  }
}

function* staggeredIterationRightRangeFirst(
  leftRanges: IterableIterator<CompositionItem[]>,
  rightRanges: IterableIterator<CompositionItem[]>,
) {
  const zippedRanges = zipIterators(leftRanges, rightRanges);

  const initial = zippedRanges.next();

  if (initial.done) return;

  let [leftRange = [], rightRange = []] = initial.value;

  yield { leftRange, rightRange };

  for (const [nextLeftRange, nextRightRange] of zippedRanges) {
    if (nextRightRange) {
      rightRange = nextRightRange;
      yield { leftRange, rightRange };
    }

    if (nextLeftRange) {
      leftRange = nextLeftRange;
      yield { leftRange, rightRange };
    }
  }
}
