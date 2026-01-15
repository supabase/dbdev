import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { Button } from '~/components/ui/button'
import { useThemeContext } from './ThemeContext'

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeContext()

  const handleThemeChange = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' && <MoonIcon className="h-5 w-5" />}
      {theme === 'light' && <SunIcon className="h-5 w-5" />}
    </Button>
  )
}

export default ThemeSwitcher
