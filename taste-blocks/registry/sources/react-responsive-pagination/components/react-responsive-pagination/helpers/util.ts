export function sanatizeInteger(maybeInteger: unknown) {
  return typeof maybeInteger === 'number' && Number.isInteger(maybeInteger)
    ? maybeInteger
    : undefined;
}

export function sanatizeBoolean(maybeBoolean: unknown) {
  return typeof maybeBoolean === 'boolean' ? maybeBoolean : undefined;
}

// V3-TODO: use native findLastIndex
export function findLastIndex<T>(
  array: ReadonlyArray<T>,
  predicate: (item: T) => boolean,
) {
  for (let k = array.length - 1; k >= 0; k--) {
    if (predicate(array[k])) return k;
  }

  return -1;
}

export class UnsupportedValueError extends Error {
  constructor(value: never) {
    super('Unsupported value: ' + value);
  }
}
