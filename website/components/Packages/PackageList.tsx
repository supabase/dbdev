import { Badge } from '@supabase/ui'
import { Typography } from '@supabase/ui'
import Link from 'next/link'
import {  PackageDetail, PackageSummary } from '../../pages/api/packages'

export default function PackageList({ packages }: { packages: PackageDetail[] | PackageSummary[] }) {
  return (
    <div className="divide-y border-b">
      {packages.map((p) => (
        <Link key={p.id} href={`/packages/${p.slug}`}>
          <a className="p-4 block hover:bg-gray-100">
            <Typography.Title level={4}>{p.slug}</Typography.Title>
            {['some-tag', 'other-tag'].map((tag) => (
              <span key={tag} className="pr-2">
                <Badge color="green">{tag}</Badge>
              </span>
            ))}
          </a>
        </Link>
      ))}
    </div>
  )
}
