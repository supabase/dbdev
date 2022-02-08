import { IconCopy, Menu, IconUser, IconPlusCircle } from '@supabase/ui'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AccountDetail } from 'pages/api/account'

const links = [
  { key: 'INFO', href: '/account/info', label: 'Account', icon: <IconUser /> },
  { key: 'PACKAGES', href: '/account/packages', label: 'Packages', icon: <IconCopy /> },
  { key: 'NEW_ORG', href: '/account/new-org', label: 'New Organization', icon: <IconPlusCircle /> },
]

export default function AccountNav({ profile }: { profile: AccountDetail | null | undefined }) {
  const router = useRouter()
  const path = router.asPath
  const orgs = profile?.organizations
  return (
    <div className="p-4">
      <Menu>
        <Menu.Group title="GENERAL" />
        {links.map((x) => (
          <Link href={x.href} key={x.key}>
            <a>
              <Menu.Item icon={x.icon} active={path === x.href}>
                {x.label}
              </Menu.Item>
            </a>
          </Link>
        ))}
        {orgs && orgs?.length > 0 && (
          <>
            <Menu.Group title="ORGANIZATIONS" />
            {orgs.map((org) => (
              <Link href={`/account/org/${org.id}`} key={org.id}>
                <a>
                  <Menu.Item>{org.display_name}</Menu.Item>
                </a>
              </Link>
            ))}
          </>
        )}
      </Menu>
    </div>
  )
}
