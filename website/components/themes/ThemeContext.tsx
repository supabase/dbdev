import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from 'react'
import { useLocalStorage } from '~/lib/local-storage'

export const LOCAL_STORAGE_KEY = 'dbdev_theme'
export const DEFAULT_THEME =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

export type Theme = 'light' | 'dark'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
})

export default ThemeContext

export const useThemeContext = () => useContext(ThemeContext)

export const useTheme = () => useThemeContext().theme

type ThemeContextProviderProps = {}

export const ThemeContextProvider = ({
  children,
}: PropsWithChildren<ThemeContextProviderProps>) => {
  const [theme, setTheme] = useLocalStorage<Theme>(
    LOCAL_STORAGE_KEY,
    DEFAULT_THEME
  )

  useEffect(() => {
    if (theme === 'dark') document.body.classList.replace('light', 'dark')
    if (theme === 'light') document.body.classList.replace('dark', 'light')
  }, [theme])

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
