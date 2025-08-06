import Link from 'next/link'

export const rightLinks = [
  { title: 'Open Source', url: 'https://supabase.com/open-source' },
  { title: 'Privacy', url: 'https://supabase.com/privacy' },
  { title: 'GitHub', url: 'https://github.com/supabase/dbdev/' },
]

const Footer = () => (
  <footer role="menu" className="container w-full flex justify-between">
    <div className="border-t w-full py-4">
      <div className="flex items-center justify-between">
        <div className="text-xs md:text-sm">
          <Link href="https://supabase.com/">© Supabase, Inc.</Link>
        </div>
        <ul className="flex items-center gap-4 text-xs md:text-sm">
          {rightLinks.map((link, index) => (
            <li key={index}>
              <Link href={link.url}>{link.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
)

export default Footer
