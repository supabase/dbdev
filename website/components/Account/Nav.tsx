import { Menu } from '@supabase/ui'
import Link from 'next/link'
import { useRouter } from 'next/router'

const links = [
  { key: 'INFO', href: '/account/info', label: 'Account' },
  { key: 'PACKAGES', href: '/account/packages', label: 'Packages' },
  { key: 'ORGS', href: '/account/orgs', label: 'Organizations' },
]

export default function AccountNav() {
  const router = useRouter()
  const path = router.asPath
  return (
    <div className="p-4">
      <Menu>
        {links.map((x) => (
          <Link href={x.href} key={x.key}>
            <a>
              <Menu.Item active={path === x.href}>{x.label}</Menu.Item>
            </a>
          </Link>
        ))}
      </Menu>
    </div>
  )
}
