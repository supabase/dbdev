import Hero from '../components/Site/Hero'
import Filters from '../components/Packages/Filters'
import PackageList from '../components/Packages/PackageList'
import RightSidebar from '../components/Layouts/RightSidebar'
import { useEffect, useState } from 'react'
import { packages, PackageDetail } from '../pages/api/packages'

export default function Index() {
  const [packageList, setPackageList] = useState<PackageDetail[]>([])

  useEffect(() => {
    getPackages()
  }, [])

  async function getPackages() {
    const { data, error } = await packages()
    if (data && !error) setPackageList(data)
  }

  return (
    <RightSidebar sidebar={FilterBar()}>
      <div className="grid grid-cols-1 gap-4 lg:col-span-2 divide-y">
        <section>
          <Hero />
        </section>
        <section>
          <PackageList packages={packageList} />
        </section>
      </div>
    </RightSidebar>
  )
}

const FilterBar = () => (
  <section>
    <Filters />
  </section>
)
