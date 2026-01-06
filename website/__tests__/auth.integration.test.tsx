import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing auth
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockRefreshSession = vi.fn()

vi.mock('~/lib/supabase', () => ({
  default: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: any) => {
        mockOnAuthStateChange(callback)
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }
      },
      refreshSession: () => mockRefreshSession(),
    },
  },
}))

// Mock next/router
const mockPush = vi.fn()
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock types
vi.mock('~/lib/types', () => ({
  isNextPageWithLayout: () => false,
}))

import {
  AuthProvider,
  useAuth,
  useSession,
  useUser,
  useIsLoggedIn,
  withAuth,
} from '~/lib/auth'

// Test component that uses auth hooks
function AuthStatus() {
  const { session, isLoading } = useAuth()
  const user = useUser()
  const isLoggedIn = useIsLoggedIn()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <div data-testid="logged-in">{isLoggedIn ? 'Yes' : 'No'}</div>
      <div data-testid="user-email">{user?.email ?? 'No user'}</div>
      <div data-testid="session">{session ? 'Has session' : 'No session'}</div>
    </div>
  )
}

// Component to test withAuth HOC
function ProtectedPage() {
  return <div>Protected Content</div>
}

const ProtectedPageWithAuth = withAuth(ProtectedPage)

describe('Auth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockRefreshSession.mockResolvedValue({ data: { session: null } })
  })

  it('shows loading state initially then resolves', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>
    )

    // Initially loading
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // After session check resolves
    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toHaveTextContent('No')
      expect(screen.getByTestId('user-email')).toHaveTextContent('No user')
      expect(screen.getByTestId('session')).toHaveTextContent('No session')
    })
  })

  it('provides user session when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
      },
      access_token: 'token-123',
    }

    mockGetSession.mockResolvedValue({ data: { session: mockSession } })

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toHaveTextContent('Yes')
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
      expect(screen.getByTestId('session')).toHaveTextContent('Has session')
    })
  })

  it('withAuth HOC redirects to sign-in when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(
      <AuthProvider>
        <ProtectedPageWithAuth />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/sign-in')
    })
  })

  it('withAuth HOC renders component when authenticated', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      access_token: 'token-123',
    }

    mockGetSession.mockResolvedValue({ data: { session: mockSession } })

    render(
      <AuthProvider>
        <ProtectedPageWithAuth />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('handles auth state changes', async () => {
    let authCallback: any

    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return {
        data: {
          subscription: { unsubscribe: vi.fn() },
        },
      }
    })

    mockGetSession.mockResolvedValue({ data: { session: null } })

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toHaveTextContent('No')
    })

    // Simulate sign in
    const mockSession = {
      user: { id: 'user-456', email: 'new@example.com' },
      access_token: 'new-token',
    }

    authCallback('SIGNED_IN', mockSession)

    await waitFor(() => {
      expect(screen.getByTestId('logged-in')).toHaveTextContent('Yes')
      expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com')
    })
  })
})
