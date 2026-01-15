import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  const handleMobileSearchBlur = useCallback((e: React.FocusEvent) => {
    // Check if the new focus target is still within the search container
    if (!mobileSearchRef.current?.contains(e.relatedTarget as Node)) {
      setMobileSearchExpanded(false)
    }
  }, [])

  return (
    <header className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 md:px-8">
      <nav className="flex items-center justify-between gap-4 md:gap-6">
        {/* Logo - hidden on mobile when search is expanded */}
        <div className={mobileSearchExpanded ? 'hidden' : 'block'}>
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

        {/* Desktop Search - hidden on mobile */}
        <div className="flex-1 max-w-3xl hidden sm:block">
          <Search />
        </div>

        {/* Desktop Navigation - hidden on mobile */}
        <div className="hidden sm:flex items-center justify-end gap-6 min-w-[160px]">
          <div className="flex items-center ml-4">
            <Button variant="link" asChild>
              <Link href="https://supabase.github.io/dbdev/" target="blank">
                Docs
              </Link>
            </Button>

            {user ? (
              <div className="flex items-center ml-4">
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
          <div className="flex items-center gap-4 pl-4 border-l dark:border-slate-700">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Mobile Navigation - visible only on mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Mobile Search - expandable */}
          {mobileSearchExpanded ? (
            <div
              ref={mobileSearchRef}
              className="flex-1"
              onBlur={handleMobileSearchBlur}
            >
              <Search autoFocus />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setMobileSearchExpanded(true)}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Bars3Icon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-white dark:bg-slate-900"
            >
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-6">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-4">
                  <Link
                    href="https://supabase.github.io/dbdev/"
                    target="blank"
                    className="text-sm font-medium hover:text-blue-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Docs
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href={`/${user?.user_metadata.handle}`}
                        className="flex items-center gap-3 text-sm font-medium hover:text-blue-500 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <AvatarWrapper size="sm" />
                        {displayName}
                      </Link>
                      <Link
                        href={`/${user?.user_metadata.handle}/_/access-tokens`}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors pl-9"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Access Tokens
                      </Link>

                      {isOrganizationsSuccess && organizations.length > 0 && (
                        <div className="pt-2 border-t dark:border-slate-700">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            Organizations
                          </p>
                          {organizations.map((org) => (
                            <Link
                              key={org.id}
                              href={`/${org.handle}`}
                              className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors py-1"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {org.display_name}
                            </Link>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => {
                          handleSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="text-sm text-left text-red-500 hover:text-red-600 transition-colors"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="text-sm font-medium hover:text-blue-500 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </nav>

                {/* Theme Switcher */}
                <div className="pt-4 border-t dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Theme
                    </span>
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
