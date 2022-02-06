import { classNames } from '../../lib/helpers'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { SITE_LINKS } from '../../lib/constants'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

const user = {
  name: 'Sign in',
  imageUrl:
    '/images/person.svg',
}

const navigation = Object.values(SITE_LINKS).filter((x) => x.nav)

export default function Nav() {
  const router = useRouter()
  const path = router.asPath
  return (
    <>
      <Disclosure as="nav" className="bg-white border-b border-gray-200">
        {({ open }) => (
          <>
            <div className="px-4">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Image
                      width={128}
                      height={48}
                      className="hidden lg:block h-8 w-auto"
                      src="/images/dbdev-lightmode.svg"
                      alt="dbdev"
                    />
                  </div>
                  <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link href={item.href} key={item.label}>
                        <a
                          target={item.target}
                          className={classNames(
                            item.href === path
                              ? 'border-neutral-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                          )}
                          aria-current={item.href === path ? 'page' : undefined}
                        >
                          {item.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {/* Profile dropdown */}
                  <Menu as="div" className="ml-3 relative">
                    <Link href="/account/info">
                      <a className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500">
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={user.imageUrl}
                          alt=""
                          width={30}
                          height={30}
                        />
                      </a>
                    </Link>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.label}
                    target={item.target}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.href === path
                        ? 'bg-neutral-50 border-neutral-500 text-neutral-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800',
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                    )}
                    aria-current={item.href === path ? 'page' : undefined}
                  >
                    {item.label}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={user.imageUrl}
                      alt=""
                      width={52}
                      height={52}
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  )
}
