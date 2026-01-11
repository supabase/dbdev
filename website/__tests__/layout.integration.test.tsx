import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer, { rightLinks } from '~/components/layouts/Footer'
import Layout from '~/components/layouts/Layout'
import { ThemeContextProvider } from '~/components/themes/ThemeContext'

// Mock supabase dependencies
vi.mock('~/lib/supabase', () => ({
  supabase: {},
}))

vi.mock('~/lib/avatars', () => ({
  getAvatarUrl: () => '/test-avatar.png',
}))

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
    push: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}))

// Mock auth hook
vi.mock('~/lib/auth', () => ({
  useUser: () => null,
}))

// Mock data hooks
vi.mock('~/data/auth/sign-out-mutation', () => ({
  useSignOutMutation: () => ({ mutate: vi.fn() }),
}))

vi.mock('~/data/organizations/users-organizations-query', () => ({
  useUsersOrganizationsQuery: () => ({
    data: [],
    isLoading: false,
    isSuccess: true,
  }),
}))

vi.mock('~/data/packages/packages-search-query', () => ({
  usePackagesSearchQuery: () => ({
    data: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
  }),
}))

describe('Layout Integration', () => {
  it('renders footer with all navigation links', () => {
    render(<Footer />)

    // Copyright link
    expect(screen.getByText('© Supabase, Inc.')).toBeInTheDocument()

    // All right links render
    rightLinks.forEach((link) => {
      const linkElement = screen.getByText(link.title)
      expect(linkElement).toBeInTheDocument()
      expect(linkElement.closest('a')).toHaveAttribute('href', link.url)
    })
  })

  it('renders full layout with navbar, content, and footer', () => {
    render(
      <ThemeContextProvider>
        <Layout>
          <div data-testid="page-content">Test Page Content</div>
        </Layout>
      </ThemeContextProvider>
    )

    // Navbar elements
    expect(screen.getByAltText('dbdev logo')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('Login')).toBeInTheDocument()

    // Main content
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
    expect(screen.getByText('Test Page Content')).toBeInTheDocument()

    // Footer
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('© Supabase, Inc.')).toBeInTheDocument()
  })

  it('renders layout with different container widths', () => {
    const { rerender } = render(
      <ThemeContextProvider>
        <Layout containerWidth="md">
          <div>Content</div>
        </Layout>
      </ThemeContextProvider>
    )

    // Default md width has max-w-4xl class
    const main = screen.getByRole('main')
    expect(main).toHaveClass('max-w-4xl')

    rerender(
      <ThemeContextProvider>
        <Layout containerWidth="full">
          <div>Content</div>
        </Layout>
      </ThemeContextProvider>
    )

    // Full width doesn't have the max-w class
    expect(main).not.toHaveClass('max-w-4xl')
  })
})
