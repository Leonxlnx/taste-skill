import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react'

/**
 * Allows using a TS v4 labeled tuple even with older typescript versions
 */
export type NamedArrayTuple<T extends (...args: any) => any> = Parameters<T>

/**
 * Utility type to declare the type of a `forwardRef` component so that the type is not "evaluated" in the declaration
 * file.
 */
export type ForwardRefComponent<P, T> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>

export type NonFunctionKeys<T> = { [K in keyof T]-?: T[K] extends Function ? never : K }[keyof T]
export type Overwrite<T, O> = Omit<T, NonFunctionKeys<O>> & O
