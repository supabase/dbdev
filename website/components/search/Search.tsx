import * as Dialog from '@radix-ui/react-dialog'
import { keepPreviousData } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { usePackagesSearchQuery } from '~/data/packages/packages-search-query'
import { useDebounce } from '~/lib/utils'
import Spinner from '../ui/spinner'
import SearchInput from './SearchInput'
import SearchPackageRow from './SearchPackageRow'

const Search = () => {
  const [searchValue, setSearchValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef<HTMLInputElement>(null)

  const onSearchChange = (value: string) => {
    setSearchValue(value)

    setIsOpen(value.trim().length > 0)
  }

  const query = useDebounce(searchValue, 300)

  const { data, isSuccess, isLoading, isError } = usePackagesSearchQuery(
    {
      query,
    },
    {
      enabled: Boolean(query),
      placeholderData: keepPreviousData,
    }
  )

  const router = useRouter()
  useEffect(() => {
    const handler = () => {
      setIsOpen(false)
    }

    router.events.on('routeChangeStart', handler)

    return () => {
      router.events.off('routeChangeStart', handler)
    }
  }, [router.events])

  return (
    <div className="relative">
      <SearchInput value={searchValue} onChange={onSearchChange} />

      <div ref={containerRef} />

      <Dialog.Root modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal container={containerRef.current}>
          <Dialog.Content
            className="absolute z-10 w-full mt-2 left-0 max-h-[85vh] border shadow-lg border-gray-300 rounded-md bg-white focus:outline-none dark:bg-slate-800 dark:border-slate-600"
            onOpenAutoFocus={(e) => {
              e.preventDefault()
            }}
          >
            {isLoading && (
              <div className="flex items-center justify-center px-4 py-6">
                <Spinner />
              </div>
            )}

            {isError && (
              <div className="flex items-center justify-center px-4 py-6">
                <p className="text-gray-700">Something went wrong</p>
              </div>
            )}

            {isSuccess &&
              (data.length > 0 ? (
                <div className="flex flex-col divide-y divide-gray-300">
                  {data.map((pkg) => (
                    <SearchPackageRow
                      key={pkg.id}
                      handle={pkg.handle}
                      partialName={pkg.partial_name}
                      createdAt={pkg.created_at}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 text-center">
                  <p className="text-gray-600">No results found</p>
                  <p className="text-sm text-gray-500">
                    To search packages in an organization, try prefixing your
                    query with an @ symbol.
                    <br />
                    For example @supabase to see packages from Supabase.
                  </p>
                </div>
              ))}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

export default Search
