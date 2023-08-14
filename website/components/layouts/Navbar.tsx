import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import Search from '~/components/search/Search'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/Avatar'
import DropdownMenu, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu'
import { useSignOutMutation } from '~/data/auth/sign-out-mutation'
import { useUsersOrganizationsQuery } from '~/data/organizations/users-organizations-query'
import { useUser } from '~/lib/auth'
import { getAvatarUrl } from '~/lib/avatars'
import { useTheme } from '../themes/ThemeContext'
import ThemeSwitcher from '../themes/ThemeSwitcher'

const Navbar = () => {
  const router = useRouter()
  const user = useUser()
  const theme = useTheme()

  const {
    data: organizations,
    isLoading: isOrganizationsLoading,
    isSuccess: isOrganizationsSuccess,
  } = useUsersOrganizationsQuery({
    userId: user?.id,
  })

  const avatarUrl = useMemo(
    () =>
      user ? getAvatarUrl(user.user_metadata.avatar_path ?? null) : undefined,
    [user]
  )

  const avatarName: string =
    user?.user_metadata.display_name ??
    user?.user_metadata.handle ??
    'Current User'

  const avatarFallback = avatarName
    .split(' ')
    .map((n) => n[0])
    .join(' ')

  const { mutate: signOut } = useSignOutMutation()
  const handleSignOut = useCallback(() => {
    signOut(undefined, {
      onSuccess() {
        toast.success('You have signed out successfully!')
        router.push('/sign-in')
      },
      onError(error) {
        toast.error(error.message)
      },
    })
  }, [router, signOut])

  const AvatarWrapper = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const display_name = user?.user_metadata.display_name
      ? user?.user_metadata.display_name
      : user?.email
    return user?.user_metadata.avatar_path === undefined ? (
      <div className="flex items-center justify-center w-6 h-6 text-gray-600 bg-gray-300 border-gray-400 rounded-full border-1 dark:border-slate-400 dark:bg-slate-500 dark:text-white">
        {display_name[0].toUpperCase()}
      </div>
    ) : (
      <Avatar size={size} className="border dark:border-slate-700">
        <AvatarImage src={avatarUrl} alt={avatarName} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <header className="px-4 py-4 border-b border-gray-100 shadow-sm dark:border-slate-700 md:px-8">
      {/* sticky top-0 bg-gray-100 dark:bg-slate-900 */}
      <nav className="flex items-center justify-between gap-4 md:gap-6">
        <div>
          <Link href="/">
            <img
              src={
                theme === 'light'
                  ? '/images/dbdev-lightmode.png'
                  : '/images/dbdev-darkmode.png'
              }
              alt="dbdev logo"
              className="h-10"
            />
          </Link>
        </div>

        <div className="flex-1 max-w-3xl hidden sm:block">
          <Search />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-6 sm:min-w-[160px]">
          <div className="flex items-center ml-1 sm:ml-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <AvatarWrapper size="md" />
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Logged in as</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${user?.user_metadata.handle}`}
                      className="flex items-center cursor-pointer"
                    >
                      {user?.user_metadata.display_name ??
                        user?.email ??
                        'Account'}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {isOrganizationsSuccess && organizations.length > 0 && (
                    <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                  )}
                  {isOrganizationsSuccess &&
                    organizations.map((org) => (
                      <DropdownMenuItem key={org.id} asChild>
                        <Link
                          href={`/${org.handle}`}
                          className="cursor-pointer"
                        >
                          {org.display_name} ({org.handle})
                        </Link>
                      </DropdownMenuItem>
                    ))}

                  <DropdownMenuItem asChild>
                    <button
                      onClick={handleSignOut}
                      className="w-full cursor-pointer"
                    >
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <Link
                  href="/sign-up"
                  className="px-1 sm:px-4 py-1 sm:py-2  transition border border-gray-300 rounded hover:text-gray-800 dark:text-slate-400 hover:border-gray-500 dark:border-slate-700 dark:hover:bg-slate-800 hover:dark:text-white"
                >
                  Sign Up
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm transition hover:text-gray-800 dark:text-slate-400 hover:dark:text-white"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 pl-4 border-l dark:border-slate-700">
            <ThemeSwitcher />

            <Link
              href="https://github.com/supabase/dbdev"
              className="transition opacity-60 hover:opacity-100"
            >
              <div className="dark:text-white">
                <svg
                  viewBox="0 0 96 96"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
