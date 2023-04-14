import { cn } from '~/lib/utils'

export interface FooterProps {
  gradientBg?: boolean
}

const Footer = ({ gradientBg = false }: FooterProps) => {
  return (
    <footer
      className={cn(
        'flex items-center w-full h-12 px-4 py-4 border-t border-gray-100 bg-white ',
        'dark:border-slate-700 dark:text-slate-400 dark:bg-slate-800',
        gradientBg ? 'dark:!bg-slate-900' : '!bg-white'
      )}
    >
      <a
        className="flex items-center justify-center gap-2"
        href="https://supabase.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        &copy; Supabase
      </a>
    </footer>
  )
}

export default Footer
