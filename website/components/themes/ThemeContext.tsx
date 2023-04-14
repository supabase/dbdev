import Head from 'next/head'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export const LOCAL_STORAGE_KEY = 'dbdev_theme'
export const DEFAULT_THEME =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

export type Theme = 'light' | 'dark'
export function isValidTheme(theme: string): theme is Theme {
  return theme === 'light' || theme === 'dark'
}

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
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (item && isValidTheme(item)) {
      setTheme(item)
    } else {
      setTheme(DEFAULT_THEME)
    }
  }, [])

  useEffect(() => {
    if (theme === 'dark') document.body.classList.replace('light', 'dark')
    if (theme === 'light') document.body.classList.replace('dark', 'light')
  }, [theme])

  const onSetTheme = useCallback((theme: Theme) => {
    setTheme(theme)
    window.localStorage.setItem(LOCAL_STORAGE_KEY, theme)
  }, [])

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme: onSetTheme,
    }),
    [theme, onSetTheme]
  )

  return (
    <>
      <Head>
        <meta
          name="theme-color"
          content={theme === 'light' ? '#f3f4f6' : '#0f172a'}
        />
      </Head>

      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </>
  )
}
