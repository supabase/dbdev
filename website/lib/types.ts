import type { ComponentType, ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

/* Next Types */

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

export function isNextPageWithLayout<T>(
  Component: ComponentType<T> | NextPageWithLayout<T, T>
): Component is NextPageWithLayout<T, T> {
  return 'getLayout' in Component && typeof Component.getLayout === 'function'
}

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

/* Utility Types */

export type NonNullableObject<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? Array<NonNullable<U>>
    : T[K] extends object
    ? NonNullableObject<T[K]>
    : NonNullable<T[K]>
}
