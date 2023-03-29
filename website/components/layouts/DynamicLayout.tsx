import { PropsWithChildren } from 'react'
import { useIsLoggedIn } from '~/lib/auth'
import AuthenticatedLayout from './AuthenticatedLayout'
import UnauthenticatedLayout from './UnauthenticatedLayout'

const DynamicLayout = ({ children }: PropsWithChildren<{}>) => {
  const isLoggedIn = useIsLoggedIn()

  return isLoggedIn ? (
    <AuthenticatedLayout>{children}</AuthenticatedLayout>
  ) : (
    <UnauthenticatedLayout>{children}</UnauthenticatedLayout>
  )
}

export default DynamicLayout
