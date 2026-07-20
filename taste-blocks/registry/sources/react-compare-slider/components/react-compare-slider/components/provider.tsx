'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import type { UseReactCompareSliderReturn } from '../types';

export type ContextProps = UseReactCompareSliderReturn;

const Context = createContext<ContextProps | null>(null);

export type ProviderProps = PropsWithChildren<ContextProps>;

/**
 * The root component of the slider - provides the state and event handlers for the slider components.
 */
export const Provider: React.FC<ProviderProps> = ({ children, ...value }) => {
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

/**
 * Access the state and event handlers of the slider - must be used within the `Provider` or `ReactCompareSlider` component.
 * @example
 * ```tsx
 * const { position, setPosition } = useReactCompareSliderContext();
 * ```
 */
export const useReactCompareSliderContext = (): ContextProps => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('useReactCompareSliderContext must be used within the Provider component');
  }

  return context;
};
