import RightSidebar from '../../components/Layouts/RightSidebar'
import { useRouter } from 'next/router'
import { Typography } from '@supabase/ui'
import PackageList from '../../components/Packages/PackageList'
import { useEffect, useState } from 'react'
import { packagesByOwner, PackageSummary } from '../../pages/api/packages'

export default function Index() {
  const [packages, setPackages] = useState<PackageSummary[]>([])
  const router = useRouter()
  const { owner } = router.query

  useEffect(() => {
    getPackages()
  }, [owner])

  async function getPackages() {
    const { data, error } = await packagesByOwner(owner as string)
    if (data && !error) setPackages(data)
  }

  return (
    <RightSidebar sidebar={Sidebar()}>
      <div className="grid grid-cols-1 gap-4 lg:col-span-2 divide-y">
        <section>
          <Typography>{owner}</Typography>
        </section>
        <section>
          <PackageList packages={packages} />
        </section>
      </div>
    </RightSidebar>
  )
}

const Sidebar = () => <section>Some sidebar</section>
