/**
 * A cut down version of suspend-react.
 * When paper-shaders only supports React 19+ we can use the use hook instead.
 */

type Tuple<T = any> = [T] | T[];
type Await<T> = T extends Promise<infer V> ? V : never;
type Cache<Keys extends Tuple<unknown>> = {
  promise: Promise<unknown>;
  keys: Keys;
  error?: any;
  response?: unknown;
};

const isPromise = (promise: any): promise is Promise<unknown> =>
  typeof promise === 'object' && typeof (promise as Promise<any>).then === 'function';

const globalCache: Cache<Tuple<unknown>>[] = [];

function shallowEqualArrays(arrA: any[], arrB: any[]) {
  if (arrA === arrB) return true;
  if (!arrA || !arrB) return false;
  const len = arrA.length;
  if (arrB.length !== len) return false;
  for (let i = 0; i < len; i++) if (arrA[i] !== arrB[i]) return false;
  return true;
}

function query<Keys extends Tuple<unknown>, Fn extends (...keys: Keys) => Promise<unknown>>(
  fn: Fn | Promise<unknown>,
  keys: Keys = null as unknown as Keys
) {
  // If no keys were given, the function is the key
  if (keys === null) keys = [fn] as unknown as Keys;

  for (const entry of globalCache) {
    // Find a match
    if (shallowEqualArrays(keys, entry.keys)) {
      // If an error occurred, throw
      if (Object.prototype.hasOwnProperty.call(entry, 'error')) throw entry.error;
      // If a response was successful, return
      if (Object.prototype.hasOwnProperty.call(entry, 'response')) {
        return entry.response as Await<ReturnType<Fn>>;
      }
      // If the promise is still unresolved, throw
      throw entry.promise;
    }
  }

  // The request is new or has changed.
  const entry: Cache<Keys> = {
    keys,
    promise:
      // Execute the promise
      (isPromise(fn) ? fn : fn(...keys))
        // When it resolves, store its value
        .then((response) => {
          entry.response = response;
        })
        // Store caught errors, they will be thrown in the render-phase to bubble into an error-bound
        .catch((error) => (entry.error = error)),
  };
  // Register the entry
  globalCache.push(entry);
  // And throw the promise, this yields control back to React
  throw entry.promise;
}

const suspend = <Keys extends Tuple<unknown>, Fn extends (...keys: Keys) => Promise<unknown>>(
  fn: Fn | Promise<unknown>,
  keys?: Keys
): Await<ReturnType<Fn>> => query(fn, keys);

export { suspend };
