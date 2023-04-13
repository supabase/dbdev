import { GitHubLogoIcon } from '@radix-ui/react-icons'
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

  const AvatarWrapper = ({ size = 'sm' }: { size?: 'sm' | 'md' }) =>
    user?.user_metadata.avatar_path === undefined ? (
      <div className="flex items-center justify-center w-6 h-6 text-gray-600 bg-gray-300 border-gray-400 rounded-full border-1 dark:border-slate-400 dark:bg-slate-500 dark:text-white">
        {user?.user_metadata.display_name[0].toUpperCase()}
      </div>
    ) : (
      <Avatar size={size} className="border dark:border-slate-700">
        <AvatarImage src={avatarUrl} alt={avatarName} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
    )

  return (
    <header className="px-4 py-4 border-b border-gray-100 shadow-sm dark:border-slate-700 md:px-8">
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

        <div className="flex-1 max-w-3xl">
          <Search />
        </div>

        <div className="flex items-center justify-end gap-6 min-w-[160px]">
          <div className="flex items-center ml-4">
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
              <div className="flex items-center gap-4">
                <Link
                  href="/sign-up"
                  className="px-4 py-2 text-sm text-gray-600 transition border border-gray-300 rounded hover:text-gray-800 dark:text-slate-400 hover:border-gray-500 dark:border-slate-700 dark:hover:bg-slate-800 hover:dark:text-white"
                >
                  Sign Up
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm text-gray-600 transition hover:text-gray-800 dark:text-slate-400 hover:dark:text-white"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 pl-4 border-l dark:border-slate-700">
            <ThemeSwitcher />

            <Link
              href="https://github.com/supabase/dbdev"
              className="transition opacity-60 hover:opacity-100"
            >
              <div className="dark:text-white">
                <GitHubLogoIcon />
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
