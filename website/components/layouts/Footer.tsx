import Link from 'next/link'

export const links = [
  { title: ` © Supabase`, url: 'https://supabase.com/' },
  { title: 'FAQs', url: '/faq' },
  { title: 'Open Source', url: 'https://supabase.com/open-source' },
  { title: 'Privacy Settings', url: 'https://supabase.com/privacy' },
]

const Footer = () => (
  <footer role="menu" className="container w-full flex justify-between">
    <div className="border-t w-full py-4">
      <ul className="grid md:flex items-center gap-4 text-xs md:text-sm">
        {links.map((link, index) => (
          <li key={index}>
            <Link href={link.url}>{link.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  </footer>
)

export default Footer
