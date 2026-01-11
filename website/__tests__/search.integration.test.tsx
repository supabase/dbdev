import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}))

// Variable to control mock behavior
let mockSearchData: any[] = []
let mockIsLoading = false
let mockIsSuccess = false
let mockIsError = false

vi.mock('~/data/packages/packages-search-query', () => ({
  usePackagesSearchQuery: () => ({
    data: mockSearchData,
    isLoading: mockIsLoading,
    isSuccess: mockIsSuccess,
    isError: mockIsError,
  }),
}))

// Mock useDebounce to return value immediately
vi.mock('~/lib/utils', async () => {
  const actual = await vi.importActual('~/lib/utils')
  return {
    ...actual,
    useDebounce: (value: string) => value,
  }
})

import Search from '~/components/search/Search'
import SearchInput from '~/components/search/SearchInput'
import SearchPackageRow from '~/components/search/SearchPackageRow'

describe('Search Integration', () => {
  beforeEach(() => {
    mockSearchData = []
    mockIsLoading = false
    mockIsSuccess = false
    mockIsError = false
  })

  it('renders search input and accepts user input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<SearchInput value="" onChange={handleChange} />)

    const input = screen.getByPlaceholderText(/search packages/i)
    expect(input).toBeInTheDocument()

    await user.type(input, 'supabase')
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders search package row with correct link and info', () => {
    render(
      <SearchPackageRow
        handle="supabase"
        partialName="pg_graphql"
        createdAt="2024-06-15T10:30:00Z"
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/supabase/pg_graphql')
    expect(screen.getByText('supabase/pg_graphql')).toBeInTheDocument()
    expect(screen.getByText('2024-06-15 10:30:00')).toBeInTheDocument()
  })

  it('shows search results when query matches packages', async () => {
    const user = userEvent.setup()
    mockSearchData = [
      {
        id: '1',
        handle: 'supabase',
        partial_name: 'pg_graphql',
        created_at: '2024-01-01',
      },
      {
        id: '2',
        handle: 'supabase',
        partial_name: 'pg_net',
        created_at: '2024-02-01',
      },
    ]
    mockIsSuccess = true

    render(<Search />)

    const input = screen.getByPlaceholderText(/search packages/i)
    await user.type(input, 'supabase')

    await waitFor(() => {
      expect(screen.getByText('supabase/pg_graphql')).toBeInTheDocument()
      expect(screen.getByText('supabase/pg_net')).toBeInTheDocument()
    })
  })

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup()
    mockSearchData = []
    mockIsSuccess = true

    render(<Search />)

    const input = screen.getByPlaceholderText(/search packages/i)
    await user.type(input, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument()
      expect(
        screen.getByText(/try prefixing your query with an @ symbol/i)
      ).toBeInTheDocument()
    })
  })

  it('shows error message when search fails', async () => {
    const user = userEvent.setup()
    mockIsError = true

    render(<Search />)

    const input = screen.getByPlaceholderText(/search packages/i)
    await user.type(input, 'test')

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })
})
