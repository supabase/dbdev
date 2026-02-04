import { forwardRef } from 'react'
import { Input } from '~/components/ui/input'

export type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onChange, autoFocus = false }, ref) {
    return (
      <>
        <Input
          ref={ref}
          id="search"
          name="search"
          placeholder="Search Packages"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
        />
      </>
    )
  }
)

export default SearchInput
