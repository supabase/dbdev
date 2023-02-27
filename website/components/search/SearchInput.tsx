import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { forwardRef } from 'react'

export type SearchInputProps = {
  value: string
  onChange: (value: string) => void
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onChange }, ref) {
    return (
      <>
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
            ref={ref}
            id="search"
            name="search"
            className="block w-full py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search Packages"
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </>
    )
  }
)

export default SearchInput
