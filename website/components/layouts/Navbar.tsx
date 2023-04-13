import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { SunIcon, MoonIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import Search from '~/components/search/Search'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/Avatar'
import { useSignOutMutation } from '~/data/auth/sign-out-mutation'
import { useUsersOrganizationsQuery } from '~/data/organizations/users-organizations-query'
import { useUser } from '~/lib/auth'
import { getAvatarUrl } from '~/lib/avatars'

const Navbar = () => {
  const router = useRouter()
  const user = useUser()
  const [theme, setTheme] = useState<string>()

  useEffect(() => {
    const theme = localStorage.dbdev_theme
    if (
      theme === 'dark' ||
      (!('dbdev_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      if (theme === 'dark') document.body.classList.replace('light', 'dark')
    } else {
      if (theme === 'light') document.body.classList.replace('dark', 'light')
    }
    setTheme(theme)
  }, [])

  useEffect(() => {
    if (theme) localStorage.setItem('dbdev_theme', theme)
    if (theme === 'dark') document.body.classList.replace('light', 'dark')
    if (theme === 'light') document.body.classList.replace('dark', 'light')
  }, [theme])

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
      <div className="flex items-center justify-center w-6 h-6 rounded-full border-1 bg-gray-300 border-gray-400 text-gray-600 dark:border-slate-400 dark:bg-slate-500 dark:text-white">
        {user?.user_metadata.display_name[0].toUpperCase()}
      </div>
    ) : (
      <Avatar size={size} className="border dark:border-slate-700">
        <AvatarImage src={avatarUrl} alt={avatarName} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
    )

  return (
    <header className="px-4 py-4 border-b border-gray-100 dark:border-slate-700 shadow-sm md:px-8">
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

        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center ml-4">
            {user ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <AvatarWrapper size="md" />
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    className="border bg-white dark:bg-slate-900 dark:border-slate-600 shadow py-2 rounded"
                  >
                    <DropdownMenu.Label className="text-xs text-gray-600 dark:text-gray-400 px-4 mb-1">
                      Logged in as
                    </DropdownMenu.Label>
                    <DropdownMenu.Item
                      asChild
                      className="px-4 py-1 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <Link
                        href={`/${user?.user_metadata.handle}`}
                        className="flex items-center"
                      >
                        <span className="text-sm">
                          {user?.user_metadata.display_name ??
                            user?.email ??
                            'Account'}
                        </span>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="h-px my-2 bg-gray-200 dark:bg-slate-700" />

                    <DropdownMenu.Group className="flex flex-col">
                      <DropdownMenu.Label className="text-xs text-gray-600 dark:text-gray-400 px-4 mb-1">
                        Organizations
                      </DropdownMenu.Label>

                      {isOrganizationsSuccess &&
                        organizations.map((org) => (
                          <DropdownMenu.Item
                            key={org.id}
                            asChild
                            className="px-4 py-1 text-sm dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                          >
                            <Link href={`/${org.handle}`}>
                              {org.display_name} ({org.handle})
                            </Link>
                          </DropdownMenu.Item>
                        ))}

                      <DropdownMenu.Item
                        asChild
                        className="px-4 py-1 hover:bg-gray-100 dark:hover:bg-slate-800"
                      >
                        <Link
                          href="/organizations/new"
                          className="text-sm dark:text-white"
                        >
                          New organization
                        </Link>
                      </DropdownMenu.Item>
                    </DropdownMenu.Group>

                    <DropdownMenu.Separator className="h-px my-2 bg-gray-200 dark:bg-slate-700" />

                    <DropdownMenu.Item
                      asChild
                      className="px-4 py-1 text-sm dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left"
                      >
                        Sign out
                      </button>
                    </DropdownMenu.Item>

                    <DropdownMenu.Arrow className="fill-gray-100" />
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/sign-up"
                  className="transition text-sm rounded text-gray-600 hover:text-gray-800 dark:text-slate-400 border border-gray-300 hover:border-gray-500 dark:border-slate-700 py-2 px-4 dark:hover:bg-slate-800 hover:dark:text-white"
                >
                  Sign Up
                </Link>
                <Link
                  href="/sign-in"
                  className="transition text-sm text-gray-600 hover:text-gray-800 dark:text-slate-400 hover:dark:text-white"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-6 border-l pl-8 py-3">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <div className="dark:text-white">
                  {theme === 'dark' ? (
                    <MoonIcon className="w-4 h-4 text-gray-400" />
                  ) : (
                    <SunIcon className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="center"
                  sideOffset={5}
                  className="w-28 border bg-white dark:bg-slate-900 dark:border-slate-600 shadow py-2 rounded"
                >
                  <DropdownMenu.RadioGroup
                    value={theme}
                    onValueChange={setTheme}
                  >
                    <DropdownMenu.RadioItem
                      value="light"
                      className="cursor-pointer pl-4 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center space-x-1 py-1"
                    >
                      <div className="dark:text-white">
                        <SunIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="pl-2 text-sm dark:text-white">Light</p>
                    </DropdownMenu.RadioItem>
                    <DropdownMenu.RadioItem
                      value="dark"
                      className="cursor-pointer pl-4 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center space-x-1 py-1"
                    >
                      <div className="dark:text-white">
                        <MoonIcon className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="pl-2 text-sm dark:text-white">Dark</p>
                    </DropdownMenu.RadioItem>
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Link
              href="https://github.com/supabase/dbdev"
              className="opacity-60 hover:opacity-100 transition"
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
