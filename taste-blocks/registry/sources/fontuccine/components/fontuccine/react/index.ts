'use client';

/**
 * react/index.ts — the `fontuccine/react` wrapper.
 *
 * THIN by contract (Phase-5 wrapper rules): props → config object; NO
 * framework-specific animation logic (the shared ticker + StretchController own
 * all of that); attach/destroy on a ref inside an effect. `react`/`react-dom` are
 * peerDependencies.
 *
 * SSR-inert: importing this module and rendering on the server touch no
 * `window`/`document` — `attach()` runs only inside `useEffect`, which never
 * fires during SSR. StrictMode-safe: the effect's mount→unmount→mount cycle maps
 * to attach→destroy→attach; the WebGL shared backend is ref-counted
 * (acquire/release), so the middle unmount does not destroy a context the remount
 * still needs (verified in test/react-wrapper).
 */
import {
  createElement,
  useEffect,
  useRef,
  type ElementType,
  type ReactNode,
  type RefObject,
} from 'react';
import { attach } from '../engine/attach';
import type { FontuccineConfig, Instance } from '../engine/types';

export type { FontuccineConfig, Instance } from '../engine/types';

const DEFAULT_CONFIG: FontuccineConfig = {};

/**
 * Attach Fontuccine to an existing ref for the lifetime of the component.
 * `config` should be memoized by the caller — a new `config` identity re-attaches
 * (destroy + attach), which is the intended way to change axis/trigger/etc.
 * Returns the live `Instance` (or null before the first client effect) via a ref,
 * for imperative `.set()` on `trigger:'custom'`.
 */
export function useFontuccine(
  ref: RefObject<HTMLElement | null>,
  config: FontuccineConfig = DEFAULT_CONFIG,
): RefObject<Instance | null> {
  const instanceRef = useRef<Instance | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const instance = attach(el, config);
    instanceRef.current = instance;
    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
    // Re-attach when the element or the config identity changes.
  }, [ref, config]);

  return instanceRef;
}

export interface FontuccineProps {
  /** Element type to render (default 'span'). */
  as?: ElementType;
  /** Fontuccine config (memoize to avoid re-attaching every render). */
  config?: FontuccineConfig;
  children?: ReactNode;
  className?: string;
  style?: Record<string, string | number>;
  [key: string]: unknown;
}

/**
 * `<Fontuccine as="h1" config={...}>Stretch me</Fontuccine>` — renders the given
 * element with the real text as children (so SSR ships the text and it stays for
 * a11y/SEO) and attaches the engine to it on the client.
 */
export function Fontuccine(props: FontuccineProps): ReactNode {
  const { as = 'span', config, children, ...rest } = props;
  const ref = useRef<HTMLElement | null>(null);
  useFontuccine(ref, config ?? DEFAULT_CONFIG);
  return createElement(as, { ...rest, ref }, children);
}

export default Fontuccine;
