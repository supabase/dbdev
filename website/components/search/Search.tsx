import { keepPreviousData } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { usePackagesSearchQuery } from '~/data/packages/packages-search-query'
import { useDebounce } from '~/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverAnchor, PopoverContent } from '../ui/popover'
import Spinner from '../ui/spinner'
import SearchInput from './SearchInput'

type SearchProps = {
  autoFocus?: boolean
}

const Search = ({ autoFocus = false }: SearchProps) => {
  const [searchValue, setSearchValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

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

  const handleSelect = useCallback(
    (handle: string, partialName: string) => {
      setIsOpen(false)
      setSearchValue('')
      router.push(`/${handle}/${partialName}`)
    },
    [router]
  )

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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            autoFocus={autoFocus}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-h-[85vh] p-0 border-border bg-background"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center px-4 py-6">
                <Spinner />
              </div>
            )}

            {isError && (
              <div className="flex items-center justify-center px-4 py-6">
                <p className="text-muted-foreground">Something went wrong</p>
              </div>
            )}

            {isSuccess && data.length === 0 && (
              <CommandEmpty>
                <div className="flex flex-col items-center gap-2">
                  <p>No results found</p>
                  <p className="text-xs text-muted-foreground">
                    Try prefixing with @ to search organizations
                  </p>
                </div>
              </CommandEmpty>
            )}

            {isSuccess && data.length > 0 && (
              <CommandGroup>
                {data.map((pkg) => (
                  <CommandItem
                    key={pkg.id}
                    value={`${pkg.handle}/${pkg.partial_name}`}
                    onSelect={() => handleSelect(pkg.handle, pkg.partial_name)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {pkg.handle}/{pkg.partial_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(pkg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default Search
