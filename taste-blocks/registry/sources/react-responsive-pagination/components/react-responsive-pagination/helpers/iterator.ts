export function* zipIterators<T, U>(
  xs: IterableIterator<T>,
  ys: IterableIterator<U>,
): Generator<[T | undefined, U | undefined]> {
  while (true) {
    const xResult = xs.next();
    const yResult = ys.next();

    if (xResult.done && yResult.done) break;

    yield [xResult.value, yResult.value];
  }
}

export function lastWhere<P>(xs: Iterable<P>, predicate: (x: P) => boolean) {
  let lastSoFar: P | undefined;

  for (const x of xs) {
    if (!predicate(x)) break;

    lastSoFar = x;
  }

  return lastSoFar;
}

export function iteratorNext<P>(xs: IterableIterator<P>) {
  const xResult = xs.next();

  return xResult.done ? undefined : xResult.value;
}
