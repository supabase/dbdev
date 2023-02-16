import Link from 'next/link'
import { useRouter } from 'next/router'
import { PropsWithChildren, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useSignOutMutation } from '~/data/auth/sign-out-mutation'
import { useUser, withAuth } from '~/lib/auth'
import Avatar from '../users/Avatar'

const AuthenticatedLayout = ({ children }: PropsWithChildren<{}>) => {
  const router = useRouter()
  const user = useUser()

  const { mutate: signOut } = useSignOutMutation()
  const handleSignOut = useCallback(() => {
    signOut(undefined, {
      onSuccess() {
        toast.success('You have signed out successfully!')
        router.replace('/')
      },
      onError(error) {
        toast.error(error.message)
      },
    })
  }, [router, signOut])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 py-4 md:px-8">
        <nav className="flex items-center justify-between">
          <div>
            <Link href="/">Home</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/account" className="inline-flex items-center">
              <Avatar
                name={user?.user_metadata.full_name}
                avatarUrl={user?.user_metadata.avatar_url}
              />
              <span className="ml-2">
                {user?.user_metadata.display_name ?? user?.email ?? 'Account'}
              </span>
            </Link>

            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </nav>
      </header>

      <main className="flex flex-col flex-1 w-full max-w-3xl px-4 mx-auto">
        {children}
      </main>

      <footer className="flex w-full h-12 px-4 border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; Supabase
        </a>
      </footer>
    </div>
  )
}

export default withAuth(AuthenticatedLayout)
