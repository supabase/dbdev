import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock react-hot-toast - must be before component import
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock the delete mutation
vi.mock('~/data/access-tokens/delete-access-token', () => ({
  useDeleteAccessTokenMutation: ({ onSuccess }: { onSuccess?: () => void }) => ({
    mutate: vi.fn((vars: { tokenId: string }) => {
      onSuccess?.()
    }),
    isLoading: false,
  }),
}))

import { toast } from 'react-hot-toast'
import AccessTokenCard from '~/components/access-tokens/AccessTokenCard'

// Setup dayjs with relativeTime
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('Access Tokens Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders access token card with all information', () => {
    const createdAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago

    renderWithQueryClient(
      <AccessTokenCard
        tokenId="token-123"
        tokenName="My API Token"
        maskedToken="sk_****_abcd"
        createdAt={createdAt}
      />
    )

    expect(screen.getByText('My API Token')).toBeInTheDocument()
    expect(screen.getByText('Token: sk_****_abcd')).toBeInTheDocument()
    expect(screen.getByText(/Created 7 days ago/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /revoke/i })).toBeInTheDocument()
  })

  it('calls delete mutation and shows toast on revoke', async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <AccessTokenCard
        tokenId="token-456"
        tokenName="Test Token"
        maskedToken="sk_****_efgh"
        createdAt={new Date().toISOString()}
      />
    )

    const revokeButton = screen.getByRole('button', { name: /revoke/i })
    await user.click(revokeButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully revoked token!')
    })
  })

  it('renders multiple tokens in a list', () => {
    const tokens = [
      { id: '1', name: 'Production API', masked: 'sk_****_prod', created: '2024-01-01' },
      { id: '2', name: 'Development API', masked: 'sk_****_dev', created: '2024-06-01' },
      { id: '3', name: 'CI/CD Token', masked: 'sk_****_cicd', created: '2024-12-01' },
    ]

    renderWithQueryClient(
      <div className="space-y-4">
        {tokens.map((token) => (
          <AccessTokenCard
            key={token.id}
            tokenId={token.id}
            tokenName={token.name}
            maskedToken={token.masked}
            createdAt={token.created}
          />
        ))}
      </div>
    )

    expect(screen.getByText('Production API')).toBeInTheDocument()
    expect(screen.getByText('Development API')).toBeInTheDocument()
    expect(screen.getByText('CI/CD Token')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /revoke/i })).toHaveLength(3)
  })
})
