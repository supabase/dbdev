import type { ComponentType, ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

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
