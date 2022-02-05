import RightSidebar from '../../../components/Layouts/RightSidebar'
import { useRouter } from 'next/router'
import { Typography } from '@supabase/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { packageBySlug, PackageDetail } from '../../../pages/api/packages'

export default function Index() {
  const [pkg, setPackageDetail] = useState<PackageDetail | null>(null)
  const router = useRouter()
  const { owner, name } = router.query
  const slug = `${owner}/${name}`

  useEffect(() => {
    getPackages()
  }, [slug])

  async function getPackages() {
    const { data, error } = await packageBySlug(slug)
    if (data && !error) setPackageDetail(data)
  }

  return (
    <RightSidebar sidebar={Sidebar()}>
      <div className="grid grid-cols-1 gap-4 lg:col-span-2 divide-y">
        <section>
          <Typography>
            {owner}/{name}
          </Typography>
          <Typography>
            by{' '}
            <Link href={`/packages/${owner}`}>
              <a>{owner}</a>
            </Link>
          </Typography>
        </section>
        {pkg == null ? <Loading /> : <Details pkg={pkg} />}
      </div>
    </RightSidebar>
  )
}

const Loading = () => <section>Loading</section>

const Sidebar = () => <section>Some sidebar</section>

const Details = ({ pkg }: { pkg: PackageDetail }) => (
  <>
    <section>{pkg.id}</section>
  </>
)
