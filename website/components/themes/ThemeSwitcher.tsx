import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useThemeContext } from './ThemeContext'

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeContext()

  const handleThemeChange = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return (
    <button
      onClick={handleThemeChange}
      className="p-1 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-100 dark:hover:text-slate-100"
    >
      {theme === 'dark' && <MoonIcon className="w-5 h-5" />}
      {theme === 'light' && <SunIcon className="w-5 h-5" />}
    </button>
  )
}

export default ThemeSwitcher
