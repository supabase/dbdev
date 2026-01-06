import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ThemeContextProvider, LOCAL_STORAGE_KEY } from '~/components/themes/ThemeContext'
import ThemeSwitcher from '~/components/themes/ThemeSwitcher'

// Mock next/head since it doesn't work in jsdom
vi.mock('next/head', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function ThemeTestApp() {
  return (
    <ThemeContextProvider>
      <ThemeSwitcher />
    </ThemeContextProvider>
  )
}

describe('Theme Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.className = 'light'
  })

  it('toggles between light and dark themes', async () => {
    const user = userEvent.setup()
    render(<ThemeTestApp />)

    const toggleButton = screen.getByRole('button')

    // Initial state is light (sun icon visible)
    expect(document.body.classList.contains('light')).toBe(true)

    // Click to switch to dark
    await user.click(toggleButton)

    await waitFor(() => {
      expect(document.body.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe('dark')
    })

    // Click to switch back to light
    await user.click(toggleButton)

    await waitFor(() => {
      expect(document.body.classList.contains('light')).toBe(true)
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe('light')
    })
  })

  it('persists theme preference in localStorage', async () => {
    const user = userEvent.setup()

    // Set initial preference
    localStorage.setItem(LOCAL_STORAGE_KEY, 'dark')
    document.body.className = 'dark'

    render(<ThemeTestApp />)

    await waitFor(() => {
      expect(document.body.classList.contains('dark')).toBe(true)
    })

    // Toggle and verify persistence
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe('light')
    })
  })
})
