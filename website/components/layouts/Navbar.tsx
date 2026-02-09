import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { toast } from '~/hooks/use-toast'
import Search from '~/components/search/Search'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useSignOutMutation } from '~/data/auth/sign-out-mutation'
import { useUsersOrganizationsQuery } from '~/data/organizations/users-organizations-query'
import { useUser } from '~/lib/auth'
import { getAvatarUrl } from '~/lib/avatars'
import { useTheme } from '../themes/ThemeContext'
import ThemeSwitcher from '../themes/ThemeSwitcher'
import { Button } from '~/components/ui/button'

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

  const displayName: string =
    user?.user_metadata.display_name ?? user?.email ?? 'Account'

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
      <div
        className={`flex items-center justify-center text-gray-600 bg-gray-300 border-gray-400 rounded-full border-1 dark:border-slate-400 dark:bg-slate-500 dark:text-white ${size === 'sm' ? 'w-6 h-6' : 'w-10 h-10'}`}
      >
        {displayName[0].toUpperCase()}
      </div>
    ) : (
      <Avatar
        className={`border dark:border-slate-700 ${size === 'sm' ? 'w-6 h-6' : 'w-10 h-10'}`}
      >
        <AvatarImage src={avatarUrl} alt={avatarName} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
    )

  return (
    <header className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 md:px-8">
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
            <Button variant="link" asChild>
              <Link href="/docs">
                Docs
              </Link>
            </Button>

            {user ? (
              <div className="flex items-center ml-1 sm:ml-4">
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
                        {displayName}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/${user?.user_metadata.handle}/_/access-tokens`}
                        className="flex items-center cursor-pointer"
                      >
                        Access Tokens
                      </Link>
                    </DropdownMenuItem>

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
              </div>
            ) : (
              <div className="flex items-center">
                <Button variant="link" asChild>
                  <Link href="/sign-in">Login</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 pl-4 border-l dark:border-slate-700">
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
