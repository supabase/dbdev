import { useUsersOrganizationsQuery } from '~/data/organizations/users-organizations-query'
import { useUser } from '~/lib/auth'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import Avatar from '../../users/Avatar'
import { useCallback, useMemo } from 'react'
import { getAvatarUrl } from '~/lib/avatars'
import { useSignOutMutation } from '~/data/auth/sign-out-mutation'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const Navbar = () => {
  const router = useRouter()
  const user = useUser()

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

  return (
    <header className="px-4 py-4 border-b border-gray-100 shadow-sm md:px-8">
      <nav className="flex items-center justify-between gap-4 md:gap-6">
        <div>
          <Link href="/">
            <img
              src="/images/dbdev-lightmode.png"
              alt="dbdev logo"
              className="h-10"
            />
          </Link>
        </div>

        <div className="flex-1 max-w-3xl">
          <label htmlFor="search" className="sr-only">
            Search Packages
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search Packages"
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center ml-4">
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Avatar
                  name={
                    user?.user_metadata.display_name ??
                    user?.user_metadata.handle ??
                    'Current User'
                  }
                  avatarUrl={avatarUrl}
                />
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={5}
                  className="px-4 py-2 bg-white border border-gray-200 rounded shadow-lg"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      href={{
                        pathname: '/profiles/[handle]/edit',
                        query: { handle: user?.user_metadata.handle },
                      }}
                      as={`/@${user?.user_metadata.handle}/edit`}
                      className="flex items-center"
                    >
                      <Avatar
                        name={
                          user?.user_metadata.display_name ??
                          user?.user_metadata.handle ??
                          'Current User'
                        }
                        avatarUrl={avatarUrl}
                        size="small"
                      />

                      <span className="ml-2 text-lg">
                        {user?.user_metadata.display_name ??
                          user?.email ??
                          'Account'}
                      </span>
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px my-2 bg-gray-200" />

                  <DropdownMenu.Group className="flex flex-col">
                    <DropdownMenu.Label className="text-xs text-gray-600">
                      Organizations
                    </DropdownMenu.Label>

                    {isOrganizationsSuccess &&
                      organizations.map((org) => (
                        <DropdownMenu.Item key={org.id} asChild>
                          <Link
                            href={{
                              pathname: '/profiles/[handle]',
                              query: { handle: org.handle },
                            }}
                            as={`/@${org.handle}`}
                          >
                            {org.display_name} (@{org.handle})
                          </Link>
                        </DropdownMenu.Item>
                      ))}

                    <DropdownMenu.Item asChild>
                      <Link href="/organizations/new">New Organization</Link>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>

                  <DropdownMenu.Separator className="h-px my-2 bg-gray-200" />

                  <DropdownMenu.Item asChild>
                    <button onClick={handleSignOut}>Sign Out</button>
                  </DropdownMenu.Item>

                  <DropdownMenu.Arrow className="fill-gray-100" />
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/sign-in" className="font-medium">
                Sign In
              </Link>

              <Link href="/sign-up" className="font-medium">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
